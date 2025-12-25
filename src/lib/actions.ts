"use server";

import { supabaseAdmin } from "./supabaseAdmin";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr"; // For cookie-based auth in server actions
import { cookies } from "next/headers";

export async function createUser(
	formData: FormData,
	role: "teacher" | "student" | "parent",
) {
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
		// 1. Update public.users
		const { error: userError } = await supabaseAdmin
			.from("users")
			.update({
				first_name: firstName,
				last_name: lastName,
				phone_number: phone,
				username: username,
			})
			.eq("id", userId);

		if (userError) throw new Error("Public user update failed: " + userError.message);

		// 2. Assign Role
		const { data: roleData } = await supabaseAdmin
			.from("roles")
			.select("id")
			.eq("name", role)
			.single();

		if (roleData) {
			await supabaseAdmin.from("user_roles").insert({
				user_id: userId,
				role_id: roleData.id,
			});
		}

		// 3. Create Specific Profile
		let profileError = null;
		if (role === "student") {
			profileError = await createStudentProfile(userId, formData, address, sex, firstName, lastName);
		} else if (role === "teacher") {
			profileError = await createTeacherProfile(userId, formData);
		} else if (role === "parent") {
			profileError = await createParentProfile(userId, formData, address);
		}

		if (profileError) throw new Error(profileError);

		revalidatePath(`/list/${role}s`);
		return { success: true };
	} catch (error: any) {
		console.error("Create user failed:", error);
		await supabaseAdmin.auth.admin.deleteUser(userId);
		return { success: false, error: error.message };
	}
}


async function generateStudentId(yearAdmitted: number): Promise<string> {
	const prefix = `MSL/${yearAdmitted}/`;
	try {
		const { data } = await supabaseAdmin
			.from("students")
			.select("admission_number")
			.ilike("admission_number", `${prefix}%`)
			.order("admission_number", { ascending: false })
			.limit(1);

		let nextNum = 1;
		if (data && data.length > 0 && data[0].admission_number) {
			const parts = data[0].admission_number.split("/");
			if (parts.length === 3) {
				nextNum = parseInt(parts[2]) + 1;
			}
		}
		return `${prefix}${String(nextNum).padStart(4, "0")}`;
	} catch (e) {
		// Fallback if DB fails, though unlikely
		return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
	}
}

// --- UPDATED: Create Student Profile ---
async function createStudentProfile(
	userId: string,
	formData: FormData,
	address: string,
	gender: string,
    firstName: string,
    lastName: string
) {
    const classIdVal = formData.get("classId");
    const classId = classIdVal ? parseInt(classIdVal as string) : null;
    const birthday = formData.get("birthday") as string;
    
    // Generate Admission Number
    const currentYear = new Date().getFullYear();
    const admissionNumber = await generateStudentId(currentYear);

	const { data: student, error } = await supabaseAdmin.from("students").insert({
		user_id: userId,
        admission_number: admissionNumber,
        first_name: firstName,
        last_name: lastName,
		date_of_birth: birthday,
		gender: gender,
		address: address,
        class_id: classId
	}).select().single();

    if (error) return "Student profile error: " + error.message;

    // Auto-assign Class Fees
    if (student && classId) {
        const { data: feeItems } = await supabaseAdmin
            .from("fee_items")
            .select("id, fee_structures!inner(class_id)")
            .eq("fee_structures.class_id", classId);

        if (feeItems && feeItems.length > 0) {
            const assignments = feeItems.map(item => ({
                student_id: student.id,
                fee_item_id: item.id
            }));
            await supabaseAdmin.from("fee_assignments").insert(assignments);
        }
    }
	return null;
}

// Add this to ui/src/lib/actions.ts

// ui/src/lib/actions.ts

export async function deleteStudent(id: number | string) {
  try {
    // 1. Fetch the student to get the linked user_id (for cleanup later)
    const { data: student, error: fetchError } = await supabaseAdmin
      .from("students")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error("Student not found");

    // 2. DELETE DEPENDENCIES (Clean up related tables first)
    
    // A. Fee Assignments (The error you saw)
    await supabaseAdmin.from("fee_assignments").delete().eq("student_id", id);
    
    // B. Attendance
    await supabaseAdmin.from("attendance").delete().eq("student_id", id);
    
    // C. Exam/Assessment Results (Assessment Marks)
    await supabaseAdmin.from("assessment_marks").delete().eq("student_id", id);

    // D. Class Enrollments
    await supabaseAdmin.from("class_enrollments").delete().eq("student_id", id);
    
    // E. Student Parents (Relationships)
    await supabaseAdmin.from("student_parents").delete().eq("student_id", id);

    // F. Payments (Optional: Usually financial records should be kept, 
    // but strict FKs force deletion. If this fails, you might need to nullify the student_id instead)
    // For now, we delete to allow the operation:
    await supabaseAdmin.from("payments").delete().eq("student_id", id);

    // 3. Delete the Student Profile
    const { error: deleteError } = await supabaseAdmin
      .from("students")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // 4. Delete the Auth User (Optional cleanup)
    if (student?.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(student.user_id);
    }

    revalidatePath("/list/students");
    return { success: true };
  } catch (error: any) {
    console.error("Delete student error:", error);
    return { success: false, error: error.message };
  }
}

export async function createSubject(formData: FormData) {
    const name = formData.get("name") as string;
    const classId = formData.get("classId");
    const teacherId = formData.get("teacherId");

    const { error } = await supabaseAdmin.from("subjects").insert({
        name,
        class_id: classId ? parseInt(classId as string) : null,
        teacher_id: teacherId ? (teacherId as string) : null,
    });

    if (error) return { success: false, error: error.message };
    revalidatePath("/list/subjects");
    return { success: true };
}

export async function updateSubject(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const classId = formData.get("classId");
    const teacherId = formData.get("teacherId");

    const { error } = await supabaseAdmin.from("subjects").update({
        name,
        class_id: classId ? parseInt(classId as string) : null,
        teacher_id: teacherId ? (teacherId as string) : null,
    }).eq("id", parseInt(id));

    if (error) return { success: false, error: error.message };
    revalidatePath("/list/subjects");
    return { success: true };
}

export async function deleteSubject(id: number | string) {
    const { error } = await supabaseAdmin.from("subjects").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/list/subjects");
    return { success: true };
}


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
		class_id: classId ? parseInt(classId as string) : null, // <--- ADD THIS LINE
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
	const amountRaw = formData.get("amount");
	const method = formData.get("method") as string;
	const description = formData.get("description") as string; // Fetch the type

    // 1. Validate Input
	if (!studentId) return { success: false, error: "Student ID is required." };
    if (!amountRaw) return { success: false, error: "Amount is required." };

	const amount = parseFloat(amountRaw as string);
    if (isNaN(amount) || amount <= 0) {
        return { success: false, error: "Please enter a valid amount greater than 0." };
    }

	try {
		// 2. Record Payment
        // We use the 'description' field to store the Receipt Type (e.g., "Academic Fees")
		const { data: payment, error: pErr } = await supabaseAdmin
			.from("payments")
			.insert({
				student_id: parseInt(studentId as string),
				amount,
				payment_method: method,
                description: description || "General Payment", // Save the type here
				payment_date: new Date().toISOString(),
			})
			.select()
			.single();

		if (pErr) throw new Error(pErr.message);

		// 3. Generate Receipt
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
        console.error("Create Receipt Error:", error);
		return { success: false, error: error.message };
	}
}




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

    // Fetch Fee Structures for the dropdown
    const { data: feeStructures } = await supabaseAdmin
      .from("fee_structures")
      .select("id, name")
      .order("name");

    return { 
      classes: classes || [], 
      academicYears: years || [],
      feeStructures: feeStructures || [], // Return this list
      success: true 
    };
  } catch (error) {
    console.error("Error fetching form data:", error);
    return { classes: [], academicYears: [], feeStructures: [], success: false };
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

// ==========================================
// MISSING / UPDATED ACTIONS
// ==========================================

// 1. ASSIGN FEE TO CLASS (Fixes "Failed to assign fees" error)
export async function assignFeeToClass(feeId: number, classId: number) {
  try {
    // A. Get all students in this class
    const { data: students, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("class_id", classId);

    if (studentError) throw studentError;
    if (!students || students.length === 0) {
        return { success: false, message: "No students found in this class." };
    }

    // B. Check which students already have this fee (to avoid duplicates)
    const { data: existing } = await supabaseAdmin
        .from("fee_assignments")
        .select("student_id")
        .eq("fee_item_id", feeId)
        .in("student_id", students.map(s => s.id));

    const existingIds = new Set(existing?.map(e => e.student_id));
    
    // C. Filter out students who already have the fee
    const newAssignments = students
        .filter(s => !existingIds.has(s.id))
        .map((student) => ({
            student_id: student.id,
            fee_item_id: feeId,
        }));

    if (newAssignments.length === 0) {
        return { success: true, message: "All students in this class already have this fee assigned." };
    }

    // D. Insert new assignments
    const { error: insertError } = await supabaseAdmin
        .from("fee_assignments")
        .insert(newAssignments);

    if (insertError) throw insertError;

    revalidatePath("/finance/fees");
    return { success: true, message: `Successfully assigned fee to ${newAssignments.length} students.` };
  } catch (error: any) {
    console.error("Assignment Error:", error);
    return { success: false, message: "Failed to assign fees: " + error.message };
  }
}

// 2. DELETE RECEIPT (Required for Receipt Page)
export async function deleteReceipt(id: number | string) {
	try {
        // Fetch receipt to find linked payment
        const { data: receipt, error: fetchErr } = await supabaseAdmin
            .from("receipts")
            .select("payment_id")
            .eq("id", id)
            .maybeSingle();
            
        if (fetchErr) throw new Error(fetchErr.message);
        
        // Delete Receipt
		const { error: rErr } = await supabaseAdmin
			.from("receipts")
			.delete()
			.eq("id", id);

		if (rErr) throw new Error(rErr.message);

        // Delete Linked Payment
        if (receipt && receipt.payment_id) {
            const { error: pErr } = await supabaseAdmin
                .from("payments")
                .delete()
                .eq("id", receipt.payment_id);
            
            if (pErr) console.warn("Linked payment delete warning:", pErr.message);
        }

		revalidatePath("/finance/receipts");
		return { success: true };
	} catch (error: any) {
		console.error("Delete receipt failed:", error);
		return { success: false, error: error.message };
	}
}

// 3. DELETE EVENT (Required for Event Page)
export async function deleteEvent(id: number | string) {
  try {
    const { error } = await supabaseAdmin
        .from("events")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
    
    revalidatePath("/");
    revalidatePath("/list/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function createClass(formData: FormData) {
	const name = formData.get("name") as string;
	const capacity = parseInt(formData.get("capacity") as string);
	const gradeId = parseInt(formData.get("gradeId") as string);
	const teacherId = formData.get("teacherId") as string;

	try {
		const { data: classData, error } = await supabaseAdmin
			.from("classes")
			.insert({
				name,
				capacity,
				grade_level_id: gradeId,
				teacher_id: teacherId || null,
			})
			.select()
			.single();

		if (error) throw new Error(error.message);

		revalidatePath("/list/classes");
		return { success: true, data: classData };
	} catch (error: any) {
		console.error("Create class error:", error);
		return { success: false, error: error.message };
	}
}

export async function updateClass(formData: FormData) {
	const id = parseInt(formData.get("id") as string);
	const name = formData.get("name") as string;
	const capacity = parseInt(formData.get("capacity") as string);
	const gradeId = parseInt(formData.get("gradeId") as string);
	const teacherId = formData.get("teacherId") as string;

	try {
		const { error } = await supabaseAdmin
			.from("classes")
			.update({
				name,
				capacity,
				grade_level_id: gradeId,
				teacher_id: teacherId || null,
			})
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/list/classes");
		return { success: true };
	} catch (error: any) {
		console.error("Update class error:", error);
		return { success: false, error: error.message };
	}
}

export async function deleteClass(id: number | string) {
	try {
		const { error } = await supabaseAdmin
			.from("classes")
			.delete()
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/list/classes");
		return { success: true };
	} catch (error: any) {
		console.error("Delete class error:", error);
		return { success: false, error: error.message };
	}
}

export async function getTeachersForDropdown() {
	try {
		const { data, error } = await supabaseAdmin
			.from("teachers")
			.select("id, first_name, last_name")
			.order("first_name");

		if (error) throw error;
		return { success: true, data: data || [] };
	} catch (error: any) {
		console.error("Fetch teachers error:", error);
		return { success: false, data: [] };
	}
}

export async function getGradeLevelsForDropdown() {
	try {
		const { data, error } = await supabaseAdmin
			.from("grade_levels")
			.select("id, name")
			.order("name");

		if (error) throw error;
		return { success: true, data: data || [] };
	} catch (error: any) {
		console.error("Fetch grade levels error:", error);
		return { success: false, data: [] };
	}
}

// ==========================================
// STUDENT ID GENERATION & VALIDATION
// ==========================================



export async function validateStudentId(studentId: string): Promise<boolean> {
	const pattern = /^MSL\/\d{4}\/\d{4}$/;
	return pattern.test(studentId);
}



export async function searchStudentsByName(
	firstName: string,
	lastName: string,
) {
	try {
		const { data, error } = await supabaseAdmin
			.from("students")
			.select(
				`
        id,
        first_name,
        last_name,
        class_id,
        classes(id, name)
      `,
		)
		.ilike("first_name", `%${firstName}%`)
		.ilike("last_name", `%${lastName}%`)
		.limit(10);

		if (error) throw error;
		return { success: true, data };
	} catch (error: any) {
		console.error("Search students by name error:", error);
		return { success: false, error: error?.message || "Unknown error" };
	}
}

export async function searchStudentsByStudentId(studentId: string) {
	try {
		const { data, error } = await supabaseAdmin
			.from("students")
			.select(
				`
        id,
        admission_number,
        first_name,
        last_name,
        class_id,
        classes(id, name)
      `,
			)
			.ilike("admission_number", `%${studentId}%`)
			.limit(10);

		if (error) throw error;
		return { success: true, data };
	} catch (error: any) {
		console.error("Search students by ID error:", error);
		return { success: false, error: error?.message || "Unknown error" };
	}
}

// ==========================================
// FEE TYPE MANAGEMENT
// ==========================================

export async function createFeeType(formData: FormData) {
	const name = formData.get("name") as string;
	const description = formData.get("description") as string;

	try {
		const { data: feeType, error } = await supabaseAdmin
			.from("fee_types")
			.insert({
				name,
				description,
			})
			.select()
			.single();

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true, data: feeType };
	} catch (error: any) {
		console.error("Create fee type error:", error);
		return { success: false, error: error.message };
	}
}

export async function updateFeeType(formData: FormData) {
	const id = parseInt(formData.get("id") as string);
	const name = formData.get("name") as string;
	const description = formData.get("description") as string;

	try {
		const { error } = await supabaseAdmin
			.from("fee_types")
			.update({
				name,
				description,
			})
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
		console.error("Update fee type error:", error);
		return { success: false, error: error.message };
	}
}

export async function deleteFeeType(id: number | string) {
	try {
		const { error } = await supabaseAdmin
			.from("fee_types")
			.delete()
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
		console.error("Delete fee type error:", error);
		return { success: false, error: error.message };
	}
}

export async function getFeeTypes() {
	try {
		const { data, error } = await supabaseAdmin
			.from("fee_types")
			.select("*")
			.order("name");

		if (error) throw error;
		return { success: true, data: data || [] };
	} catch (error: any) {
		console.error("Fetch fee types error:", error);
		return { success: false, data: [] };
	}
}

// ==========================================
// ACADEMIC YEAR & TERMS MANAGEMENT
// ==========================================

export async function createAcademicYear(formData: FormData) {
	const name = formData.get("name") as string;
	const startDate = formData.get("startDate") as string;
	const endDate = formData.get("endDate") as string;

	try {
		const { data: year, error } = await supabaseAdmin
			.from("academic_years")
			.insert({
				name,
				start_date: startDate,
				end_date: endDate,
			})
			.select()
			.single();

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true, data: year };
	} catch (error: any) {
		console.error("Create academic year error:", error);
		return { success: false, error: error.message };
	}
}

export async function getAcademicYears() {
	try {
		const { data, error } = await supabaseAdmin
			.from("academic_years")
			.select("*")
			.order("name", { ascending: false });

		if (error) throw error;
		return { success: true, data: data || [] };
	} catch (error: any) {
		console.error("Fetch academic years error:", error);
		return { success: false, data: [] };
	}
}

export async function createTerm(formData: FormData) {
	const name = formData.get("name") as string;
	const academicYearId = parseInt(formData.get("academicYearId") as string);
	const startDate = formData.get("startDate") as string;
	const endDate = formData.get("endDate") as string;

	try {
		const { data: term, error } = await supabaseAdmin
			.from("terms")
			.insert({
				name,
				academic_year_id: academicYearId,
				start_date: startDate,
				end_date: endDate,
			})
			.select()
			.single();

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true, data: term };
	} catch (error: any) {
		console.error("Create term error:", error);
		return { success: false, error: error.message };
	}
}

export async function getTermsByAcademicYear(academicYearId: number) {
	try {
		const { data, error } = await supabaseAdmin
			.from("terms")
			.select("*")
			.eq("academic_year_id", academicYearId)
			.order("name");

		if (error) throw error;
		return { success: true, data: data || [] };
	} catch (error: any) {
		console.error("Fetch terms error:", error);
		return { success: false, data: [] };
	}
}

// ==========================================
// DISCOUNT MANAGEMENT
// ==========================================

export async function createDiscount(formData: FormData) {
	const name = formData.get("name") as string;
	const type = formData.get("type") as "percentage" | "fixed"; // percentage or fixed
	const value = parseFloat(formData.get("value") as string);
	const studentId = formData.get("studentId") as string;
	const feeStructureId = formData.get("feeStructureId") as string;

	try {
		const { data: discount, error } = await supabaseAdmin
			.from("discounts")
			.insert({
				name,
				type,
				value,
				student_id: studentId ? parseInt(studentId) : null,
				fee_structure_id: feeStructureId ? parseInt(feeStructureId) : null,
			})
			.select()
			.single();

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true, data: discount };
	} catch (error: any) {
		console.error("Create discount error:", error);
		return { success: false, error: error.message };
	}
}

export async function updateDiscount(formData: FormData) {
	const id = parseInt(formData.get("id") as string);
	const name = formData.get("name") as string;
	const type = formData.get("type") as "percentage" | "fixed";
	const value = parseFloat(formData.get("value") as string);
	const studentId = formData.get("studentId") as string;
	const feeStructureId = formData.get("feeStructureId") as string;

	try {
		const { error } = await supabaseAdmin
			.from("discounts")
			.update({
				name,
				type,
				value,
				student_id: studentId ? parseInt(studentId) : null,
				fee_structure_id: feeStructureId ? parseInt(feeStructureId) : null,
			})
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
		console.error("Update discount error:", error);
		return { success: false, error: error.message };
	}
}

export async function deleteDiscount(id: number | string) {
	try {
		const { error } = await supabaseAdmin
			.from("discounts")
			.delete()
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
		console.error("Delete discount error:", error);
		return { success: false, error: error.message };
	}
}

export async function getDiscountsByStudent(studentId: number) {
	try {
		const { data, error } = await supabaseAdmin
			.from("discounts")
			.select("*")
			.eq("student_id", studentId);

		if (error) throw error;
		return { success: true, data: data || [] };
	} catch (error: any) {
		console.error("Fetch student discounts error:", error);
		return { success: false, data: [] };
	}
}

export async function getDiscountsByFeeStructure(feeStructureId: number) {
	try {
		const { data, error } = await supabaseAdmin
			.from("discounts")
			.select("*")
			.eq("fee_structure_id", feeStructureId);

		if (error) throw error;
		return { success: true, data: data || [] };
	} catch (error: any) {
		console.error("Fetch structure discounts error:", error);
		return { success: false, data: [] };
	}
}

// ==========================================
// DYNAMIC FEE CALCULATION
// ==========================================

export async function calculateTotalFeePayable(
	studentId: number,
	feeStructureId: number,
	termId?: number,
) {
	try {
		// 1. Get fee items for the structure
		const { data: feeItems, error: feeError } = await supabaseAdmin
			.from("fee_items")
			.select("amount")
			.eq("fee_structure_id", feeStructureId);

		if (feeError) throw feeError;

		const totalFee = feeItems?.reduce((sum, item) => sum + item.amount, 0) || 0;

		// 2. Get discounts applicable to this student and structure
		const { data: discounts, error: discError } = await supabaseAdmin
			.from("discounts")
			.select("type, value")
			.or(
				`student_id.eq.${studentId},fee_structure_id.eq.${feeStructureId}`,
			);

		if (discError) throw discError;

		let totalDiscount = 0;
		if (discounts) {
			for (const discount of discounts) {
				if (discount.type === "percentage") {
					totalDiscount += (totalFee * discount.value) / 100;
				} else if (discount.type === "fixed") {
					totalDiscount += discount.value;
				}
			}
		}

		// 3. Get payments already made by this student (for this structure/term if applicable)
		let paymentQuery = supabaseAdmin
			.from("payments")
			.select("amount")
			.eq("student_id", studentId);

		if (termId) {
			paymentQuery = paymentQuery.eq("term_id", termId);
		}

		const { data: payments, error: paymentError } = await paymentQuery;

		if (paymentError && paymentError.code !== "PGRST116") throw paymentError;

		const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

		// 4. Calculate outstanding balance
		const grossTotal = totalFee - totalDiscount;
		const outstandingBalance = Math.max(0, grossTotal - totalPaid);

		return {
			success: true,
			data: {
				totalFee,
				totalDiscount,
				grossTotal,
				totalPaid,
				outstandingBalance,
			},
		};
	} catch (error: any) {
		console.error("Fee calculation error:", error);
		return {
			success: false,
			error: error.message,
			data: {
				totalFee: 0,
				totalDiscount: 0,
				grossTotal: 0,
				totalPaid: 0,
				outstandingBalance: 0,
			},
		};
	}
}

// ==========================================
// FINANCIAL REPORTING
// ==========================================

export async function getFinanceReportByStudent(studentId: number) {
	try {
		const { data: fees, error: feeError } = await supabaseAdmin
			.from("fee_assignments")
			.select(
				`
        id,
        fee_items(amount, fee_structures(name, class_id)),
        students(student_id, classes(name))
      `,
			)
			.eq("student_id", studentId);

		if (feeError && feeError.code !== "PGRST116") throw feeError;

		const { data: payments, error: paymentError } = await supabaseAdmin
			.from("payments")
			.select("amount, payment_date, payment_method")
			.eq("student_id", studentId);

		if (paymentError && paymentError.code !== "PGRST116") throw paymentError;

		const { data: discounts, error: discountError } = await supabaseAdmin
			.from("discounts")
			.select("name, type, value")
			.eq("student_id", studentId);

		if (discountError && discountError.code !== "PGRST116") throw discountError;

		return {
			success: true,
			data: {
				fees: fees || [],
				payments: payments || [],
				discounts: discounts || [],
			},
		};
	} catch (error: any) {
		console.error("Student finance report error:", error);
		return { success: false, error: error.message, data: {} };
	}
}

export async function getFinanceReportByClass(classId: number, termId?: number) {
	try {
		// Get all students in the class
		const { data: students, error: studentError } = await supabaseAdmin
			.from("students")
			.select("id, first_name, last_name, class_id")
			.eq("class_id", classId);

		if (studentError) throw studentError;

		if (!students || students.length === 0) {
			return {
				success: true,
				data: {
					students: [],
					totals: {
						totalBilled: 0,
						totalPaid: 0,
						outstandingBalance: 0,
					},
				},
			};
		}

		const studentIds = students.map((s) => s.id);

		// Get fee assignments
		const { data: feeAssignments, error: feeError } = await supabaseAdmin
			.from("fee_assignments")
			.select("student_id, fee_items(amount)")
			.in("student_id", studentIds);

		if (feeError && feeError.code !== "PGRST116") throw feeError;

		// Get payments
		let paymentQuery = supabaseAdmin
			.from("payments")
			.select("student_id, amount")
			.in("student_id", studentIds);

		if (termId) {
			paymentQuery = paymentQuery.eq("term_id", termId);
		}

		const { data: payments, error: paymentError } = await paymentQuery;

		if (paymentError && paymentError.code !== "PGRST116") throw paymentError;

		// Calculate totals per student
		const reportData = students.map((student) => {
			const studentFees = feeAssignments?.filter(
				(fa) => fa.student_id === student.id,
			);
			const studentPayments = payments?.filter(
				(p) => p.student_id === student.id,
			);

			const totalBilled =
				studentFees?.reduce((sum: number, fa: any) => sum + (fa.fee_items?.[0]?.amount || 0), 0) || 0;
			const totalPaid =
				studentPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

			return {
				studentId: student.id,
				name: `${student.first_name} ${student.last_name}`,
				totalBilled,
				totalPaid,
				balance: Math.max(0, totalBilled - totalPaid),
			};
		});

		const totals = reportData.reduce(
			(acc, student) => {
				acc.totalBilled += student.totalBilled;
				acc.totalPaid += student.totalPaid;
				acc.outstandingBalance += student.balance;
				return acc;
			},
			{ totalBilled: 0, totalPaid: 0, outstandingBalance: 0 },
		);

		return {
			success: true,
			data: {
				students: reportData,
				totals,
			},
		};
	} catch (error: any) {
		console.error("Class finance report error:", error);
		return { success: false, error: error.message, data: {} };
	}
}

export async function getFinanceReportByTerm(termId: number) {
	try {
		// Get all classes
		const { data: classes, error: classError } = await supabaseAdmin
			.from("classes")
			.select("id, name");

		if (classError) throw classError;

		if (!classes || classes.length === 0) {
			return {
				success: true,
				data: {
					classes: [],
					totals: {
						totalBilled: 0,
						totalPaid: 0,
						outstandingBalance: 0,
					},
				},
			};
		}

		const classReports = await Promise.all(
			classes.map(async (cls) => {
				const report = await getFinanceReportByClass(cls.id, termId);
				return {
					classId: cls.id,
					className: cls.name,
					...report.data,
				};
			}),
		);

		const totals = classReports.reduce(
			(acc, classReport) => {
				acc.totalBilled += classReport.totals?.totalBilled || 0;
				acc.totalPaid += classReport.totals?.totalPaid || 0;
				acc.outstandingBalance += classReport.totals?.outstandingBalance || 0;
				return acc;
			},
			{ totalBilled: 0, totalPaid: 0, outstandingBalance: 0 },
		);

		return {
			success: true,
			data: {
				classes: classReports,
				totals,
			},
		};
	} catch (error: any) {
		console.error("Term finance report error:", error);
		return { success: false, error: error.message, data: {} };
	}
}