"use client";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createReceipt } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ReceiptForm = ({
	setOpen,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
	const { register, handleSubmit, watch, setValue } = useForm();
	const router = useRouter();

	// Step Control
	const [step, setStep] = useState(1);
	const [students, setStudents] = useState<any[]>([]);
	const [selectedStudent, setSelectedStudent] = useState<any>(null);
	const [balanceInfo, setBalanceInfo] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Watch input for search
	const firstNameSearch = watch("searchFirstName");
	const lastNameSearch = watch("searchLastName");

	// Step 1: Search Student
	const handleSearch = async () => {
		setLoading(true);
		// Note: This relies on Supabase ilike filtering on joined tables or a view
		const { data, error } = await supabase
			.from("students")
			.select(
				`
            id, admission_number,
            users!inner(first_name, last_name),
            classes(id, name)
        `,
			)
			.ilike("users.first_name", `%${firstNameSearch || ""}%`)
			.ilike("users.last_name", `%${lastNameSearch || ""}%`)
			.limit(5);

		if (data) setStudents(data);
		setLoading(false);
	};

	// Step 2: Select Student & Fetch Debt
	const selectStudent = async (student: any) => {
		setSelectedStudent(student);
		setLoading(true);

		// Fetch Total Fees for this student's class
		// Logic: Look at fee_assignments or structures for this class
		// Simplified: Get items linked to student via fee_assignments if exists
		let totalFees = 0;

		// Check fee assignments
		const { data: assignments } = await supabase
			.from("fee_assignments")
			.select("fee_items(amount)")
			.eq("student_id", student.id);

		if (assignments) {
			totalFees = assignments.reduce(
				(sum, a) => sum + (a.fee_items?.amount || 0),
				0,
			);
		} else {
			// Fallback: Check fee structures for the class
			// (Assuming you auto-assign or want to check structure directly)
		}

		// Fetch Total Paid
		const { data: payments } = await supabase
			.from("payments")
			.select("amount")
			.eq("student_id", student.id);

		const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

		setBalanceInfo({
			totalFees,
			totalPaid,
			balance: totalFees - totalPaid,
		});

		setValue("studentId", student.id); // Hidden field for submission
		setStep(2);
		setLoading(false);
	};

	const onSubmit = handleSubmit(async (data: any) => {
		const formData = new FormData();
		formData.append("studentId", selectedStudent.id);
		formData.append("amount", data.amount);
		formData.append("method", data.method);

		const res = await createReceipt(formData);
		if (res.success) {
			setOpen(false);
			router.refresh();
			router.push(`/finance/receipts/print/${res.receiptId}`);
		} else {
			setError(res.error || "Failed");
		}
	});

	return (
		<div className='flex flex-col gap-4 max-h-[80vh] overflow-y-auto'>
			<h1 className='text-xl font-bold'>Issue Receipt</h1>

			{step === 1 && (
				<div className='flex flex-col gap-4'>
					<p className='text-sm text-gray-500'>Step 1: Find Student</p>
					<div className='flex gap-2'>
						<InputField
							label='First Name'
							name='searchFirstName'
							register={register}
						/>
						<InputField
							label='Last Name'
							name='searchLastName'
							register={register}
						/>
					</div>
					<button
						onClick={handleSearch}
						type='button'
						className='bg-blue-500 text-white p-2 rounded'>
						Search
					</button>

					<div className='flex flex-col gap-2 mt-2'>
						{loading && <p>Searching...</p>}
						{students.map((s) => (
							<div
								key={s.id}
								onClick={() => selectStudent(s)}
								className='p-3 border rounded hover:bg-gray-100 cursor-pointer'>
								<p className='font-bold'>
									{s.users.first_name} {s.users.last_name}
								</p>
								<p className='text-xs text-gray-500'>
									{s.classes?.name} | {s.admission_number}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{step === 2 && selectedStudent && (
				<form onSubmit={onSubmit} className='flex flex-col gap-4'>
					<div className='bg-blue-50 p-4 rounded text-sm text-black'>
						<p>
							<strong>Student:</strong> {selectedStudent.users.first_name}{" "}
							{selectedStudent.users.last_name}
						</p>
						<p>
							<strong>Class:</strong> {selectedStudent.classes?.name}
						</p>
						<hr className='my-2' />
						<p>Total Fees: GHS {balanceInfo.totalFees.toFixed(2)}</p>
						<p>Paid So Far: GHS {balanceInfo.totalPaid.toFixed(2)}</p>
						<p className='text-red-600 font-bold'>
							Balance: GHS {balanceInfo.balance.toFixed(2)}
						</p>
					</div>

					<InputField
						label='Amount Paying Now (GHS)'
						name='amount'
						type='number'
						register={register}
					/>

					<div className='flex flex-col gap-2'>
						<label className='text-xs text-gray-500'>Payment Method</label>
						<select {...register("method")} className='p-2 border rounded-md'>
							<option value='Cash'>Cash</option>
							<option value='Mobile Money'>Mobile Money</option>
							<option value='Bank Deposit'>Bank Deposit</option>
						</select>
					</div>

					<span className='text-red-500 text-sm'>{error}</span>
					<div className='flex gap-2'>
						<button
							type='button'
							onClick={() => setStep(1)}
							className='bg-gray-300 text-black p-2 rounded-md flex-1'>
							Back
						</button>
						<button className='bg-blue-600 text-white p-2 rounded-md flex-1'>
							Generate Receipt
						</button>
					</div>
				</form>
			)}
		</div>
	);
};
export default ReceiptForm;

// "use client";
// import { useForm } from "react-hook-form";
// import InputField from "../InputField";
// import { createReceipt } from "@/lib/actions";
// import { useRouter } from "next/navigation";
// import { Dispatch, SetStateAction, useState } from "react";

// const ReceiptForm = ({
// 	setOpen,
// }: {
// 	setOpen: Dispatch<SetStateAction<boolean>>;
// }) => {
// 	const { register, handleSubmit } = useForm();
// 	const router = useRouter();
// 	const [msg, setMsg] = useState("");

// 	const onSubmit = handleSubmit(async (data: any) => {
// 		const formData = new FormData();
// 		formData.append("admissionNumber", data.admissionNumber);
// 		formData.append("amount", data.amount);
// 		formData.append("method", data.method);

// 		const res = await createReceipt(formData);
// 		if (res.success) {
// 			setOpen(false);
// 			router.refresh();
// 			// Redirect to the printable receipt page
// 			router.push(`/finance/receipts/print/${res.receiptId}`); // We will create this page
// 		} else {
// 			setMsg(res.error || "Failed");
// 		}
// 	});

// 	return (
// 		<form className='flex flex-col gap-4' onSubmit={onSubmit}>
// 			<h1 className='text-xl font-bold'>Issue Receipt</h1>
// 			<InputField
// 				label='Student Admission No.'
// 				name='admissionNumber'
// 				register={register}
// 			/>
// 			<InputField
// 				label='Amount Paid (GHS)'
// 				name='amount'
// 				type='number'
// 				register={register}
// 			/>

// 			<div className='flex flex-col gap-2'>
// 				<label className='text-xs text-gray-500'>Payment Method</label>
// 				<select {...register("method")} className='p-2 border rounded-md'>
// 					<option value='Cash'>Cash</option>
// 					<option value='Mobile Money'>Mobile Money</option>
// 					<option value='Bank Deposit'>Bank Deposit</option>
// 				</select>
// 			</div>

// 			<span className='text-red-500 text-sm'>{msg}</span>
// 			<button className='bg-blue-600 text-white p-2 rounded-md'>
// 				Generate Receipt
// 			</button>
// 		</form>
// 	);
// };
// export default ReceiptForm;
