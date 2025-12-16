"use client";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createReceipt, searchStudents, getFeeFormData } from "@/lib/actions";
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

	const [step, setStep] = useState(1);
	const [students, setStudents] = useState<any[]>([]);
	const [selectedStudent, setSelectedStudent] = useState<any>(null);
	const [balanceInfo, setBalanceInfo] = useState<any>(null);
	const [feeStructures, setFeeStructures] = useState<any[]>([]); // Store fee types
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const firstNameSearch = watch("searchFirstName");
	const lastNameSearch = watch("searchLastName");

	// Fetch Fee Structures on mount
	useEffect(() => {
		const fetchFees = async () => {
			const res = await getFeeFormData();
			if (res.success && res.feeStructures) {
				setFeeStructures(res.feeStructures);
			} else {
                // Fallback options if DB fetch fails or is empty
                setFeeStructures([
                    { id: 'acad', name: 'Academic Fees' },
                    { id: 'book', name: 'Book Fees' },
                    { id: 'souv', name: 'Souvenirs' }
                ]);
            }
		};
		fetchFees();
	}, []);

	// Step 1: Search Student
	const handleSearch = async () => {
		setLoading(true);
		const res = await searchStudents(firstNameSearch || "", lastNameSearch || "");
		if (res.success && res.data) {
			setStudents(res.data);
		} else {
			setStudents([]);
		}
		setLoading(false);
	};

	const selectStudent = async (student: any) => {
		setSelectedStudent(student);
		setLoading(true);

		// Calculate Fees
		let totalFees = 0;
		const { data: assignments } = await supabase
			.from("fee_assignments")
			.select("fee_items(amount)")
			.eq("student_id", student.id);

		if (assignments) {
			totalFees = assignments.reduce(
				(sum: number, a: any) => sum + (a.fee_items?.amount || 0),
				0,
			);
		}

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

		setValue("studentId", student.id);
		setStep(2);
		setLoading(false);
	};

	const onSubmit = handleSubmit(async (data: any) => {
		const formData = new FormData();
		formData.append("studentId", selectedStudent.id);
		formData.append("amount", data.amount);
		formData.append("method", data.method);
		// Append the selected Fee Type (Name)
		formData.append("description", data.description);

		const res = await createReceipt(formData);
		if (res.success) {
			setOpen(false);
			router.refresh();
			router.push(`/finance/receipts/print/${res.receiptId}`);
		} else {
			setError(res.error || "Failed");
		}
	});

	const getClassName = (s: any) => {
		return s.classes?.name || "No Class Assigned";
	};

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
						disabled={loading}
						className='bg-blue-500 text-white p-2 rounded disabled:opacity-50'>
						{loading ? "Searching..." : "Search"}
					</button>

					<div className='flex flex-col gap-2 mt-2'>
						{students.length === 0 && !loading && (
							<p className='text-xs text-gray-400'>No students found.</p>
						)}
						{students.map((s) => (
							<div
								key={s.id}
								onClick={() => selectStudent(s)}
								className='p-3 border rounded hover:bg-gray-100 cursor-pointer'>
								<p className='font-bold'>
									{s.users.first_name} {s.users.last_name}
								</p>
								<p className='text-xs text-gray-500'>
									{getClassName(s)} | {s.admission_number}
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
							<strong>Class:</strong> {getClassName(selectedStudent)}
						</p>
						<hr className='my-2' />
						<p>Total Fees: GHS {balanceInfo?.totalFees.toFixed(2)}</p>
						<p className='text-blue-800 font-semibold'>
							Amount Received So Far: GHS {balanceInfo?.totalPaid.toFixed(2)}
						</p>
						<p className='text-red-600 font-bold'>
							Balance: GHS {balanceInfo?.balance.toFixed(2)}
						</p>
					</div>

					<InputField
						label='Amount Paying Now (GHS)'
						name='amount'
						type='number'
						register={register}
					/>

					{/* New Field: Payment For (Fee Structure) */}
					<div className='flex flex-col gap-2'>
						<label className='text-xs text-gray-500'>Payment For</label>
						<select 
                            {...register("description")} 
                            className='p-2 border rounded-md'
                            required
                        >
							<option value="">Select Receipt Type</option>
                            {feeStructures.map((fee) => (
                                <option key={fee.id} value={fee.name}>
                                    {fee.name}
                                </option>
                            ))}
						</select>
					</div>

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
// import { createReceipt, searchStudents } from "@/lib/actions";
// import { useRouter } from "next/navigation";
// import { Dispatch, SetStateAction, useState } from "react";
// import { supabase } from "@/lib/supabase";

// const ReceiptForm = ({
// 	setOpen,
// }: {
// 	setOpen: Dispatch<SetStateAction<boolean>>;
// }) => {
// 	const { register, handleSubmit, watch, setValue } = useForm();
// 	const router = useRouter();

// 	const [step, setStep] = useState(1);
// 	const [students, setStudents] = useState<any[]>([]);
// 	const [selectedStudent, setSelectedStudent] = useState<any>(null);
// 	const [balanceInfo, setBalanceInfo] = useState<any>(null);
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState("");

// 	const firstNameSearch = watch("searchFirstName");
// 	const lastNameSearch = watch("searchLastName");

// 	// Step 1: Search Student
// 	const handleSearch = async () => {
// 		setLoading(true);
// 		const res = await searchStudents(firstNameSearch || "", lastNameSearch || "");
// 		if (res.success && res.data) {
// 			setStudents(res.data);
// 		} else {
// 			setStudents([]);
// 		}
// 		setLoading(false);
// 	};

// 	const selectStudent = async (student: any) => {
// 		setSelectedStudent(student);
// 		setLoading(true);

// 		// Calculate Fees
// 		let totalFees = 0;
// 		const { data: assignments } = await supabase
// 			.from("fee_assignments")
// 			.select("fee_items(amount)")
// 			.eq("student_id", student.id);

// 		if (assignments) {
// 			totalFees = assignments.reduce(
// 				(sum: number, a: any) => sum + (a.fee_items?.amount || 0),
// 				0,
// 			);
// 		}

// 		const { data: payments } = await supabase
// 			.from("payments")
// 			.select("amount")
// 			.eq("student_id", student.id);

// 		const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

// 		setBalanceInfo({
// 			totalFees,
// 			totalPaid,
// 			balance: totalFees - totalPaid,
// 		});

// 		setValue("studentId", student.id);
// 		setStep(2);
// 		setLoading(false);
// 	};

// 	const onSubmit = handleSubmit(async (data: any) => {
// 		const formData = new FormData();
// 		formData.append("studentId", selectedStudent.id);
// 		formData.append("amount", data.amount);
// 		formData.append("method", data.method);

// 		const res = await createReceipt(formData);
// 		if (res.success) {
// 			setOpen(false);
// 			router.refresh();
// 			router.push(`/finance/receipts/print/${res.receiptId}`);
// 		} else {
// 			setError(res.error || "Failed");
// 		}
// 	});

// 	const getClassName = (s: any) => {
// 		return s.classes?.name || "No Class Assigned";
// 	};

// 	return (
// 		<div className='flex flex-col gap-4 max-h-[80vh] overflow-y-auto'>
// 			<h1 className='text-xl font-bold'>Issue Receipt</h1>

// 			{step === 1 && (
// 				<div className='flex flex-col gap-4'>
// 					<p className='text-sm text-gray-500'>Step 1: Find Student</p>
// 					<div className='flex gap-2'>
// 						<InputField
// 							label='First Name'
// 							name='searchFirstName'
// 							register={register}
// 						/>
// 						<InputField
// 							label='Last Name'
// 							name='searchLastName'
// 							register={register}
// 						/>
// 					</div>
// 					<button
// 						onClick={handleSearch}
// 						type='button'
// 						disabled={loading}
// 						className='bg-blue-500 text-white p-2 rounded disabled:opacity-50'>
// 						{loading ? "Searching..." : "Search"}
// 					</button>

// 					<div className='flex flex-col gap-2 mt-2'>
// 						{students.length === 0 && !loading && (
// 							<p className='text-xs text-gray-400'>No students found.</p>
// 						)}
// 						{students.map((s) => (
// 							<div
// 								key={s.id}
// 								onClick={() => selectStudent(s)}
// 								className='p-3 border rounded hover:bg-gray-100 cursor-pointer'>
// 								<p className='font-bold'>
// 									{s.users.first_name} {s.users.last_name}
// 								</p>
// 								<p className='text-xs text-gray-500'>
// 									{getClassName(s)} | {s.admission_number}
// 								</p>
// 							</div>
// 						))}
// 					</div>
// 				</div>
// 			)}

// 			{step === 2 && selectedStudent && (
// 				<form onSubmit={onSubmit} className='flex flex-col gap-4'>
// 					<div className='bg-blue-50 p-4 rounded text-sm text-black'>
// 						<p>
// 							<strong>Student:</strong> {selectedStudent.users.first_name}{" "}
// 							{selectedStudent.users.last_name}
// 						</p>
// 						<p>
// 							<strong>Class:</strong> {getClassName(selectedStudent)}
// 						</p>
// 						<hr className='my-2' />
// 						<p>Total Fees: GHS {balanceInfo?.totalFees.toFixed(2)}</p>

// 						{/* UPDATED LABEL HERE */}
// 						<p className='text-blue-800 font-semibold'>
// 							Amount Received So Far: GHS {balanceInfo?.totalPaid.toFixed(2)}
// 						</p>

// 						<p className='text-red-600 font-bold'>
// 							Balance: GHS {balanceInfo?.balance.toFixed(2)}
// 						</p>
// 					</div>

// 					<InputField
// 						label='Amount Paying Now (GHS)'
// 						name='amount'
// 						type='number'
// 						register={register}
// 					/>

// 					<div className='flex flex-col gap-2'>
// 						<label className='text-xs text-gray-500'>Payment Method</label>
// 						<select {...register("method")} className='p-2 border rounded-md'>
// 							<option value='Cash'>Cash</option>
// 							<option value='Mobile Money'>Mobile Money</option>
// 							<option value='Bank Deposit'>Bank Deposit</option>
// 						</select>
// 					</div>

// 					<span className='text-red-500 text-sm'>{error}</span>
// 					<div className='flex gap-2'>
// 						<button
// 							type='button'
// 							onClick={() => setStep(1)}
// 							className='bg-gray-300 text-black p-2 rounded-md flex-1'>
// 							Back
// 						</button>
// 						<button className='bg-blue-600 text-white p-2 rounded-md flex-1'>
// 							Generate Receipt
// 						</button>
// 					</div>
// 				</form>
// 			)}
// 		</div>
// 	);
// };
// export default ReceiptForm;


