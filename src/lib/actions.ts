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

export async function createFeeStructure(formData: FormData) {
	const name = formData.get("name") as string;
	const amount = parseFloat(formData.get("amount") as string);
	const classId = formData.get("classId");
	const academicYearId = formData.get("academicYearId"); // NEW

	try {
		// 1. Create Structure
		const { data: struct, error: sErr } = await supabaseAdmin
			.from("fee_structures")
			.insert({
				name,
				academic_year_id: academicYearId
					? parseInt(academicYearId as string)
					: null,
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
			const { data: students } = await supabaseAdmin
				.from("class_enrollments")
				.select("student_id")
				.eq("class_id", parseInt(classId as string));
			// .eq("academic_year_id", academicYearId); // Ideally filter by year too

			if (students && students.length > 0) {
				const assignments = students.map((s) => ({
					fee_item_id: item.id,
					student_id: s.student_id,
				}));

				const { error: assignErr } = await supabaseAdmin
					.from("fee_assignments")
					.insert(assignments);

				if (assignErr)
					console.error("Error assigning fees to students:", assignErr);
			}
		}

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

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
		const { error } = await supabaseAdmin
			.from("fee_structures")
			.delete()
			.eq("id", id);

		if (error) throw new Error(error.message);

		revalidatePath("/finance/fees");
		return { success: true };
	} catch (error: any) {
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

export async function createAnnouncement(formData: FormData) {
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	// If classId is empty string, treat as null (school-wide)
	const classIdVal = formData.get("classId");
	const classId = classIdVal ? parseInt(classIdVal as string) : null;

	const { error } = await supabaseAdmin.from("announcements").insert({
		title,
		description,
		class_id: classId,
		date: new Date().toISOString(),
	});

	if (error) return { success: false, error: error.message };
	revalidatePath("/"); // Refresh dashboards
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
	gender: string,
) {
	const gradeLevelId = formData.get("gradeId");
	const birthday = formData.get("birthday") as string;
	// Generate a random admission number
	const admissionNumber = `ST${new Date().getFullYear()}${Math.floor(
		1000 + Math.random() * 9000,
	)}`;

	const { error } = await supabaseAdmin.from("students").insert({
		user_id: userId,
		admission_number: admissionNumber,
		date_of_birth: birthday,
		gender: gender,
		address: address,
		current_grade_level_id: gradeLevelId
			? parseInt(gradeLevelId as string)
			: null,
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
