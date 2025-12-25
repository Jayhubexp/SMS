"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createDiscount, updateDiscount, getFeeFormData } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const schema = z.object({
	name: z.string().min(1, { message: "Discount name is required!" }),
	type: z.enum(["percentage", "fixed"], {
		message: "Discount type must be percentage or fixed!",
	}),
	value: z
		.string()
		.refine((val) => !isNaN(parseFloat(val)), {
			message: "Value must be a number!",
		})
		.refine((val) => parseFloat(val) > 0, {
			message: "Value must be greater than 0!",
		}),
	studentId: z.string().optional(),
	feeStructureId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const DiscountForm = ({
	type,
	data,
	setOpen,
}: {
	type: "create" | "update";
	data?: any;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<Inputs>({
		resolver: zodResolver(schema),
		defaultValues: data || {},
	});

	const router = useRouter();
	const [msg, setMsg] = useState("");
	const [students, setStudents] = useState<any[]>([]);
	const [feeStructures, setFeeStructures] = useState<any[]>([]);

	const discountType = watch("type");

	useEffect(() => {
		const fetchData = async () => {
			const res = await getFeeFormData();
			if (res.success) {
				setFeeStructures(res.feeStructures || []);
			}
		};
		fetchData();
	}, []);

	const onSubmit = handleSubmit(async (formData: any) => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("type", formData.type);
		payload.append("value", formData.value);
		if (formData.studentId) {
			payload.append("studentId", formData.studentId);
		}
		if (formData.feeStructureId) {
			payload.append("feeStructureId", formData.feeStructureId);
		}

		let res;
		if (type === "update") {
			payload.append("id", data.id);
			res = await updateDiscount(payload);
		} else {
			res = await createDiscount(payload);
		}

		if (res.success) {
			setOpen(false);
			router.refresh();
		} else {
			setMsg(res.error || "Failed to save discount");
		}
	});

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<h1 className="text-xl font-bold">
				{type === "create" ? "Create" : "Edit"} Discount
			</h1>

			<InputField
				label="Discount Name"
				name="name"
				type="text"
				register={register}
				defaultValue={data?.name}
				error={errors.name}
				placeholder="e.g. Scholarship, Sibling Discount"
			/>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">Discount Type</label>
				<select
					{...register("type")}
					className="p-2 border rounded-md"
					defaultValue={data?.type || "percentage"}>
					<option value="percentage">Percentage (%)</option>
					<option value="fixed">Fixed Amount (GHS)</option>
				</select>
				{errors.type && (
					<p className="text-red-500 text-xs">{errors.type.message}</p>
				)}
			</div>

			<InputField
				label={`Discount Value ${discountType === "percentage" ? "(%)" : "(GHS)"}`}
				name="value"
				type="number"
				step="0.01"
				register={register}
				defaultValue={data?.value}
				error={errors.value}
				placeholder={
					discountType === "percentage"
						? "e.g. 10 for 10%"
						: "e.g. 50 for GHS 50"
				}
			/>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">
					Apply to Student (Optional)
				</label>
				<select
					{...register("studentId")}
					className="p-2 border rounded-md"
					defaultValue={data?.student_id || ""}>
					<option value="">All Students</option>
					{/* Note: You would populate this with actual students from the database */}
					{students.map((student) => (
						<option key={student.id} value={student.id}>
							{student.first_name} {student.last_name}
						</option>
					))}
				</select>
			</div>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">
					Apply to Fee Structure (Optional)
				</label>
				<select
					{...register("feeStructureId")}
					className="p-2 border rounded-md"
					defaultValue={data?.fee_structure_id || ""}>
					<option value="">All Fee Structures</option>
					{feeStructures.map((structure) => (
						<option key={structure.id} value={structure.id}>
							{structure.name}
						</option>
					))}
				</select>
			</div>

			{msg && (
				<p className={msg.includes("success") ? "text-green-500" : "text-red-500"}>
					{msg}
				</p>
			)}

			<button
				type="submit"
				className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500">
				{type === "create" ? "Create" : "Update"}
			</button>
		</form>
	);
};

export default DiscountForm;
