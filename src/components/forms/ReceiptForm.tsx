"use client";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
	createReceipt,
	searchStudentsByName,
	searchStudentsByStudentId,
	getFeeFormData,
	calculateTotalFeePayable,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

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
	const [feeStructures, setFeeStructures] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [searchType, setSearchType] = useState<"name" | "studentId">("name");

	const firstNameSearch = watch("searchFirstName");
	const lastNameSearch = watch("searchLastName");
	const studentIdSearch = watch("searchStudentId");

	// Fetch Fee Structures on mount
	useEffect(() => {
		const fetchFees = async () => {
			const res = await getFeeFormData();
			if (res.success && res.feeStructures) {
				setFeeStructures(res.feeStructures);
			} else {
				// Fallback options if DB fetch fails or is empty
				setFeeStructures([
					{ id: "acad", name: "Academic Fees" },
					{ id: "book", name: "Book Fees" },
					{ id: "souv", name: "Souvenirs" },
				]);
			}
		};
		fetchFees();
	}, []);

	// Step 1: Search Student by Name
	const handleSearchByName = async () => {
		if (!firstNameSearch && !lastNameSearch) {
			setError("Please enter a name to search");
			return;
		}

		setLoading(true);
		setError("");

		const res = await searchStudentsByName(
			firstNameSearch || "",
			lastNameSearch || "",
		);
		if (res.success && res.data) {
			setStudents(res.data);
		} else {
			setStudents([]);
			setError(res.error || "No students found");
		}
		setLoading(false);
	};

	// Step 1: Search Student by Student ID
	const handleSearchByStudentId = async () => {
		if (!studentIdSearch) {
			setError("Please enter a student ID to search");
			return;
		}

		setLoading(true);
		setError("");

		const res = await searchStudentsByStudentId(studentIdSearch);
		if (res.success && res.data) {
			setStudents(res.data);
		} else {
			setStudents([]);
			setError(res.error || "No students found");
		}
		setLoading(false);
	};

	const selectStudent = async (student: any) => {
		setSelectedStudent(student);
		setLoading(true);
		setError("");

		try {
			// Use the improved fee calculation function
			const feeResult = await calculateTotalFeePayable(student.id, 1); // Assuming default structure

			if (feeResult.success) {
				setBalanceInfo(feeResult.data);
			} else {
				setBalanceInfo({
					totalFee: 0,
					totalDiscount: 0,
					grossTotal: 0,
					totalPaid: 0,
					outstandingBalance: 0,
				});
			}
		} catch (err) {
			console.error("Error calculating fees:", err);
		}

		setValue("studentId", student.id);
		setStep(2);
		setLoading(false);
	};

	const onSubmit = handleSubmit(async (data: any) => {
		if (!selectedStudent) {
			setError("Please select a student");
			return;
		}

		const formData = new FormData();
		formData.append("studentId", selectedStudent.id);
		formData.append("amount", data.amount);
		formData.append("method", data.method);
		formData.append("description", data.description);

		setLoading(true);
		const res = await createReceipt(formData);
		setLoading(false);

		if (res.success) {
			setOpen(false);
			router.refresh();
			router.push(`/finance/receipts/print/${res.receiptId}`);
		} else {
			setError(res.error || "Failed to record payment");
		}
	});

	const getClassName = (s: any) => {
		return s.classes?.name || "No Class Assigned";
	};

	return (
		<div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
			<h1 className="text-xl font-bold">Record Payment</h1>

			{step === 1 && (
				<div className="flex flex-col gap-4">
					<p className="text-sm text-gray-500">Step 1: Find Student</p>

					{/* Search Type Toggle */}
					<div className="flex gap-2 border rounded-md p-2">
						<button
							type="button"
							onClick={() => setSearchType("name")}
							className={`flex-1 py-1 px-2 rounded ${
								searchType === "name"
									? "bg-blue-500 text-white"
									: "bg-gray-200"
							}`}>
							Search by Name
						</button>
						<button
							type="button"
							onClick={() => setSearchType("studentId")}
							className={`flex-1 py-1 px-2 rounded ${
								searchType === "studentId"
									? "bg-blue-500 text-white"
									: "bg-gray-200"
							}`}>
							Search by Student ID
						</button>
					</div>

					{/* Name Search */}
					{searchType === "name" && (
						<>
							<div className="flex gap-2">
								<InputField
									label="First Name"
									name="searchFirstName"
									register={register}
								/>
								<InputField
									label="Last Name"
									name="searchLastName"
									register={register}
								/>
							</div>
							<button
								onClick={handleSearchByName}
								type="button"
								disabled={loading}
								className="bg-blue-500 text-white p-2 rounded disabled:opacity-50">
								{loading ? "Searching..." : "Search by Name"}
							</button>
						</>
					)}

					{/* Student ID Search */}
					{searchType === "studentId" && (
						<>
							<InputField
								label="Student ID"
								name="searchStudentId"
								placeholder="e.g. MSL/2024/0007"
								register={register}
							/>
							<button
								onClick={handleSearchByStudentId}
								type="button"
								disabled={loading}
								className="bg-blue-500 text-white p-2 rounded disabled:opacity-50">
								{loading ? "Searching..." : "Search by Student ID"}
							</button>
						</>
					)}

					{error && (
						<p className="text-red-500 text-sm">{error}</p>
					)}

					<div className="flex flex-col gap-2 mt-2">
						{students.length === 0 && !loading && (
							<p className="text-xs text-gray-400">
								Enter search criteria and click search.
							</p>
						)}
						{students.map((s) => (
							<div
								key={s.id}
								onClick={() => selectStudent(s)}
								className="p-3 border rounded hover:bg-gray-100 cursor-pointer">
								<p className="font-bold">
									{s.first_name} {s.last_name}
								</p>
								<p className="text-xs text-gray-500">
									ID: {s.admission_number} | {getClassName(s)}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{step === 2 && selectedStudent && (
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<div className="bg-blue-50 p-4 rounded text-sm text-black">
						<p>
							<strong>Student:</strong> {selectedStudent.first_name}{" "}
							{selectedStudent.last_name}
						</p>
						<p>
							<strong>Student ID:</strong> {selectedStudent.admission_number}
						</p>
						<p>
							<strong>Class:</strong> {getClassName(selectedStudent)}
						</p>
						<hr className="my-2" />
						<p>Total Fee (Gross): GHS {balanceInfo?.totalFee.toFixed(2)}</p>
						{balanceInfo?.totalDiscount > 0 && (
							<p className="text-purple-600">
								Less Discount: -GHS {balanceInfo?.totalDiscount.toFixed(2)}
							</p>
						)}
						<p className="font-semibold">
							Total Due: GHS {balanceInfo?.grossTotal.toFixed(2)}
						</p>
						<p className="text-blue-800 font-semibold">
							Amount Paid So Far: GHS {balanceInfo?.totalPaid.toFixed(2)}
						</p>
						<p className={`font-bold ${
							balanceInfo?.outstandingBalance > 0
								? "text-red-600"
								: "text-green-600"
						}`}>
							Outstanding Balance: GHS{" "}
							{balanceInfo?.outstandingBalance.toFixed(2)}
						</p>
					</div>

					<InputField
						label="Amount Paying Now (GHS)"
						name="amount"
						type="number"
						step="0.01"
						register={register}
						required
					/>

					{/* Payment For (Fee Structure) */}
					<div className="flex flex-col gap-2">
						<label className="text-xs text-blue-800 font-semibold">
							Payment For (Fee Type)
						</label>
						<select
							{...register("description")}
							className="p-2 border rounded-md text-black"
							required>
							<option value="">Select Fee Type</option>
							{feeStructures.map((fee) => (
								<option key={fee.id} value={fee.name}>
									{fee.name}
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-xs text-gray-500">Payment Method</label>
						<select
							{...register("method")}
							className="p-2 border rounded-md text-black">
							<option value="Cash">Cash</option>
							<option value="Mobile Money">Mobile Money</option>
							<option value="Bank Deposit">Bank Deposit</option>
						</select>
					</div>

					{error && <span className="text-red-500 text-sm">{error}</span>}
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setStep(1)}
							className="bg-gray-300 text-black p-2 rounded-md flex-1">
							Back
						</button>
						<button
							type="submit"
							disabled={loading}
							className="bg-blue-600 text-white p-2 rounded-md flex-1 disabled:opacity-50">
							{loading ? "Processing..." : "Generate Receipt"}
						</button>
					</div>
				</form>
			)}
		</div>
	);
};
export default ReceiptForm;

