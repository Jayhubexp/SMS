"use server";

import { supabaseAdmin } from "./supabaseAdmin";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr"; // For cookie-based auth in server actions
import { cookies } from "next/headers";

// ==========================================
// USER MANAGEMENT ACTIONS
// ==========================================

export async function createUser(
	formData: FormData,
	role: "teacher" | "student" | "parent",
) {
	// ... (Keep existing createUser logic)
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const username = formData.get("username") as string;
	const firstName = formData.get("firstName") as string;
	const lastName = formData.get("lastName") as string;
	const phone = formData.get("phone") as string;
	const address = formData.get("address") as string;
	const sex = formData.get("sex") as string;

	const { data: authData, error: authError } =
		await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { username, firstName, lastName, role },
		});

	if (authError) return { success: false, error: authError.message };

	const userId = authData.user.id;

	try {
		const { error: userError } = await supabaseAdmin
			.from("users")
			.update({
				first_name: firstName,
				last_name: lastName,
				phone_number: phone,
				username: username,
			})
			.eq("id", userId);

		if (userError)
			throw new Error(
				"Failed to update public user details: " + userError.message,
			);

		const { data: roleData, error: roleError } = await supabaseAdmin
			.from("roles")
			.select("id")
			.eq("name", role)
			.single();

		if (roleError || !roleData) throw new Error("Role not found: " + role);

		const { error: assignError } = await supabaseAdmin
			.from("user_roles")
			.insert({
				user_id: userId,
				role_id: roleData.id,
			});

		if (assignError)
			throw new Error("Failed to assign role: " + assignError.message);

		let profileError = null;

		if (role === "student") {
			profileError = await createStudentProfile(userId, formData, address, sex);
		} else if (role === "teacher") {
			profileError = await createTeacherProfile(userId, formData);
		} else if (role === "parent") {
			profileError = await createParentProfile(userId, formData, address);
		}

		if (profileError) throw new Error(profileError);

		revalidatePath(`/list/${role}s`);
		return { success: true };
	} catch (error: any) {
		console.error("Process failed, rolling back:", error);
		await supabaseAdmin.auth.admin.deleteUser(userId);
		return { success: false, error: error.message };
	}


}



// ==========================================
// FINANCE ACTIONS
// ==========================================

// ui/src/lib/actions.ts

// ... existing imports

export async function createFeeStructure(formData: FormData) {
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const classId = formData.get("classId");
  const academicYearId = formData.get("academicYearId");

  try {
    // 1. Create Structure
    const { data: struct, error: sErr } = await supabaseAdmin
      .from("fee_structures")
      .insert({
        name,
        academic_year_id: academicYearId ? parseInt(academicYearId as string) : null,
      })
      .select()
      .single();

    if (sErr) throw new Error(sErr.message);

    // 2. Add Fee Item
    const { data: item, error: iErr } = await supabaseAdmin
      .from("fee_items")
      .insert({
        fee_structure_id: struct.id,
        name: name,
        amount: amount,
        is_compulsory: true,
      })
      .select()
      .single();

    if (iErr) throw new Error(iErr.message);

    // 3. AUTOMATICALLY ASSIGN DEBT TO STUDENTS
    if (classId) {
      // UPDATED LOGIC: Fetch directly from 'students' table instead of 'class_enrollments'
      const { data: students } = await supabaseAdmin
        .from("students")
        .select("id") // Fetch student IDs
        .eq("class_id", parseInt(classId as string));

      if (students && students.length > 0) {
        const assignments = students.map((s) => ({
          fee_item_id: item.id,
          student_id: s.id, // Use s.id from students table
        }));

        const { error: assignErr } = await supabaseAdmin
          .from("fee_assignments")
          .insert(assignments);

        if (assignErr) console.error("Error assigning fees to students:", assignErr);
      }
    }

    revalidatePath("/finance/fees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ... rest of your actions

export async function updateFeeStructure(formData: FormData) {
	const id = formData.get("id") as string;
	const name = formData.get("name") as string;
	const amount = parseFloat(formData.get("amount") as string);
	// academicYearId is less likely to change but can be added

	try {
		// Update Structure Name
		const { error: sErr } = await supabaseAdmin
			.from("fee_structures")
			.update({ name })
			.eq("id", parseInt(id));

		if (sErr) throw new Error(sErr.message);

		// Update Item Amount (Simplified: updates the first item for this structure)
		// In a complex app, you'd update specific fee_items
		const { error: iErr } = await supabaseAdmin
			.from("fee_items")
			.update({ amount, name }) // Keep name synced
			.eq("fee_structure_id", parseInt(id));

		if (iErr) throw new Error(iErr.message);

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function deleteFeeStructure(id: number | string) {
	try {
		// 1. Fetch related Fee Items first
		const { data: items } = await supabaseAdmin
			.from("fee_items")
			.select("id")
			.eq("fee_structure_id", id);

		if (items && items.length > 0) {
			const itemIds = items.map((i) => i.id);

			// 2. Delete Fee Assignments (Debts) linked to these items
			const { error: assignErr } = await supabaseAdmin
				.from("fee_assignments")
				.delete()
				.in("fee_item_id", itemIds);

			if (assignErr) throw new Error("Failed to delete assignments: " + assignErr.message);

			// 3. Delete Fee Items
			const { error: itemErr } = await supabaseAdmin
				.from("fee_items")
				.delete()
				.eq("fee_structure_id", id); // specific structure items

			if (itemErr) throw new Error("Failed to delete fee items: " + itemErr.message);
		}

		// 4. Finally, Delete the Fee Structure
		const { error } = await supabaseAdmin
			.from("fee_structures")
			.delete()
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
		console.error("Delete failed:", error);
		return { success: false, error: error.message };
	}
}

export async function createReceipt(formData: FormData) {
	const studentId = formData.get("studentId");
	const amount = parseFloat(formData.get("amount") as string);
	const method = formData.get("method") as string; // 'Cash', 'Mobile Money'

	try {
		if (!studentId) throw new Error("Student ID is required.");

		// 1. Record Payment
		const { data: payment, error: pErr } = await supabaseAdmin
			.from("payments")
			.insert({
				student_id: parseInt(studentId as string),
				amount,
				payment_method: method,
				payment_date: new Date().toISOString(),
			})
			.select()
			.single();

		if (pErr) throw new Error(pErr.message);

		// 2. Generate Receipt
		const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;

		const { error: rErr } = await supabaseAdmin.from("receipts").insert({
			payment_id: payment.id,
			receipt_number: receiptNumber,
			issued_at: new Date().toISOString(),
		});

		if (rErr) throw new Error(rErr.message);

		revalidatePath("/finance/receipts");
		return { success: true, receiptId: payment.id };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// ==========================================
// COMMUNICATION & EVENTS ACTIONS
// ==========================================

// --- ANNOUNCEMENT ACTIONS ---

export async function createAnnouncement(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const classIdVal = formData.get("classId");
  const classId = classIdVal ? parseInt(classIdVal as string) : null;

  const { error } = await supabaseAdmin.from("announcements").insert({
    title,
    description,
    class_id: classId, 
    date: new Date().toISOString()
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/list/announcements");
  return { success: true };
}

export async function updateAnnouncement(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const classIdVal = formData.get("classId");
  const classId = classIdVal ? parseInt(classIdVal as string) : null;

  const { error } = await supabaseAdmin
    .from("announcements")
    .update({
      title,
      description,
      class_id: classId,
    })
    .eq("id", parseInt(id));

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/list/announcements");
  return { success: true };
}

export async function deleteAnnouncement(id: number | string) {
  const { error } = await supabaseAdmin
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/");
  revalidatePath("/list/announcements");
  return { success: true };
}

export async function createEvent(formData: FormData) {
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const startTime = new Date(formData.get("startTime") as string).toISOString();
	const endTime = new Date(formData.get("endTime") as string).toISOString();

	const { error } = await supabaseAdmin.from("events").insert({
		title,
		description,
		start_time: startTime,
		end_time: endTime,
	});

	if (error) return { success: false, error: error.message };
	revalidatePath("/");
	revalidatePath("/list/events");
	return { success: true };
}

// ==========================================
// INTERNAL HELPER FUNCTIONS
// ==========================================

async function createStudentProfile(
  userId: string,
  formData: FormData,
  address: string,
  gender: string
) {
  // Change: Get classId instead of gradeId
  const classId = formData.get("classId");
  
  const birthday = formData.get("birthday") as string;
  const admissionNumber = `ST${new Date().getFullYear()}${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const { error } = await supabaseAdmin.from("students").insert({
    user_id: userId,
    admission_number: admissionNumber,
    date_of_birth: birthday,
    gender: gender,
    address: address,
    class_id: classId ? parseInt(classId as string) : null, // Updated column
    // current_grade_level_id: ... (Removed)
  });

  return error ? "Student profile error: " + error.message : null;
}

async function createParentProfile(
	userId: string,
	formData: FormData,
	address: string,
) {
	const { error } = await supabaseAdmin.from("parents").insert({
		user_id: userId,
		address: address,
	});
	return error ? "Parent profile error: " + error.message : null;
}

async function createTeacherProfile(userId: string, formData: FormData) {
	const qualification = (formData.get("qualification") as string) || "N/A";
	const username = formData.get("username") as string;
	const firstName = formData.get("firstName") as string;
	const lastName = formData.get("lastName") as string;
	const email = formData.get("email") as string;
	const phone = formData.get("phone") as string;

	const { error } = await supabaseAdmin.from("teachers").insert({
		id: userId,
		qualifications: qualification,
		username: username,
		first_name: firstName,
		last_name: lastName,
		email: email,
		phone_number: phone,
	});

	return error ? "Teacher profile error: " + error.message : null;
}

export async function changePassword(formData: FormData) {
	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	if (password !== confirmPassword) {
		return { success: false, error: "Passwords do not match." };
	}

	if (password.length < 6) {
		return { success: false, error: "Password must be at least 6 characters." };
	}

	// We need the current user's session to change their password
	const cookieStore = cookies();
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return { success: false, error: "User not authenticated." };
	}

	// Update Password in Auth
	const { error: updateError } = await supabase.auth.updateUser({
		password: password,
	});

	if (updateError) {
		return { success: false, error: updateError.message };
	}

	// Mark as changed in public.users table
	// Use supabaseAdmin to bypass RLS if necessary, or just supabase if policy allows update own
	const { error: dbError } = await supabaseAdmin
		.from("users")
		.update({ password_changed: true })
		.eq("id", user.id);

	if (dbError) {
		console.error("Failed to update password_changed flag:", dbError);
		// Continue anyway as the auth password was changed
	}

	return { success: true };
}
// ... existing imports in ui/src/lib/actions.ts

// Add this new function at the end of the file
// ... existing imports

export async function searchStudents(firstName: string, lastName: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("students")
      .select(`
        id, 
        admission_number,
        users!inner(first_name, last_name),
        classes(id, name) 
      `) // <--- Now we can fetch 'classes' directly!
      .ilike("users.first_name", `%${firstName}%`)
      .ilike("users.last_name", `%${lastName}%`)
      .limit(5);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Search error:", error);
    return { success: false, error: error.message };
  }
}
4// ui/src/lib/actions.ts

// ... existing code ...

export async function getFeeFormData() {
  try {
    const { data: classes } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .order("name");
      
    const { data: years } = await supabaseAdmin
      .from("academic_years")
      .select("id, name")
      .order("name");

    return { 
      classes: classes || [], 
      academicYears: years || [],
      success: true 
    };
  } catch (error) {
    console.error("Error fetching form data:", error);
    return { classes: [], academicYears: [], success: false };
  }
}

export async function getClasses() {
  try {
    const { data } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .order("name");
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Fetch classes error:", error);
    return { success: false, data: [] };
  }
}