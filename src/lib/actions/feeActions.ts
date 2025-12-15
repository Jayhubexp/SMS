"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function assignFeeToClass(feeId: number, classId: number) {
  try {
    // 1. Get all students in this class
    const { data: students, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("class_id", classId);

    if (studentError) throw studentError;
    if (!students || students.length === 0) return { success: false, message: "No students found in this class." };

    // 2. Prepare assignment records
    const assignments = students.map((student) => ({
      student_id: student.id,
      fee_item_id: feeId,
    }));

    // 3. Batch Insert (Ignore duplicates if your DB has a unique constraint)
    const { error: insertError } = await supabaseAdmin
      .from("fee_assignments")
      .upsert(assignments, { onConflict: "student_id, fee_item_id", ignoreDuplicates: true });

    if (insertError) throw insertError;

    revalidatePath("/finance/fees");
    return { success: true, message: `Successfully assigned fee to ${students.length} students.` };
  } catch (error: any) {
    console.error("Assignment Error:", error);
    return { success: false, message: "Failed to assign fees." };
  }
}