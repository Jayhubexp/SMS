"use client";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createFeeStructure, updateFeeStructure } from "@/lib/actions"; // Ensure updateFeeStructure is exported in actions
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const FeeForm = ({
	setOpen,
	type,
	data,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>;
	type?: "create" | "update";
	data?: any;
}) => {
	const { register, handleSubmit } = useForm({ defaultValues: data });
	const router = useRouter();
	const [msg, setMsg] = useState("");
	const [classes, setClasses] = useState<any[]>([]);
	const [academicYears, setAcademicYears] = useState<any[]>([]);

	// Fetch Classes and Academic Years on mount
	useEffect(() => {
		const fetchData = async () => {
			const { data: cls } = await supabase.from("classes").select("id, name");
			const { data: years } = await supabase
				.from("academic_years")
				.select("id, name");
			if (cls) setClasses(cls);
			if (years) setAcademicYears(years);
		};
		fetchData();
	}, []);

	const onSubmit = handleSubmit(async (formData: any) => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("amount", formData.amount);
		if (formData.classId) payload.append("classId", formData.classId);
		if (formData.academicYearId)
			payload.append("academicYearId", formData.academicYearId);

		let res;
		if (type === "update") {
			payload.append("id", data.id);
			res = await updateFeeStructure(payload);
		} else {
			res = await createFeeStructure(payload);
		}

		if (res.success) {
			setOpen(false);
			router.refresh();
			alert(`Fee Structure ${type === "create" ? "Created" : "Updated"}!`);
		} else {
			setMsg(res.error || "Failed");
		}
	});

	return (
		<form className='flex flex-col gap-4' onSubmit={onSubmit}>
			<h1 className='text-xl font-bold'>
				{type === "create" ? "Create" : "Edit"} Fee Structure
			</h1>

			<InputField
				label='Fee Name (e.g. Term 1 Tuition)'
				name='name'
				register={register}
			/>
			{/* For Edit, show amount from first item if data structure allows, or refetch */}
			<InputField
				label='Amount (GHS)'
				name='amount'
				type='number'
				register={register}
				defaultValue={data?.fee_items?.[0]?.amount}
			/>

			{/* Academic Year Selection */}
			<div className='flex flex-col gap-2'>
				<label className='text-xs text-gray-500'>Academic Year</label>
				<select
					{...register("academicYearId")}
					className='p-2 border rounded-md'
					required
					defaultValue={data?.academic_year_id}>
					<option value=''>Select Academic Year</option>
					{academicYears.map((year) => (
						<option key={year.id} value={year.id}>
							{year.name}
						</option>
					))}
				</select>
			</div>

			{/* Class Selection */}
			<div className='flex flex-col gap-2'>
				<label className='text-xs text-gray-500'>
					Class (Leave blank for All Classes)
				</label>
				<select {...register("classId")} className='p-2 border rounded-md'>
					<option value=''>All Classes</option>
					{classes.map((cls) => (
						<option key={cls.id} value={cls.id}>
							{cls.name}
						</option>
					))}
				</select>
			</div>

			<span className='text-red-500 text-sm'>{msg}</span>
			<button className='bg-blue-600 text-white p-2 rounded-md'>
				{type === "create" ? "Create" : "Update"}
			</button>
		</form>
	);
};
export default FeeForm;

// "use client";
// import { useForm } from "react-hook-form";
// import InputField from "../InputField";
// import { createFeeStructure } from "@/lib/actions";
// import { useRouter } from "next/navigation";
// import { Dispatch, SetStateAction, useState } from "react";

// const FeeForm = ({
// 	setOpen,
// }: {
// 	setOpen: Dispatch<SetStateAction<boolean>>;
// }) => {
// 	const { register, handleSubmit } = useForm();
// 	const router = useRouter();
// 	const [msg, setMsg] = useState("");

// 	const onSubmit = handleSubmit(async (data: any) => {
// 		const formData = new FormData();
// 		formData.append("name", data.name);
// 		formData.append("amount", data.amount);
// 		if (data.classId) formData.append("classId", data.classId);

// 		const res = await createFeeStructure(formData);
// 		if (res.success) {
// 			setOpen(false);
// 			router.refresh();
// 			alert("Fee Structure Created & Assigned!");
// 		} else {
// 			setMsg(res.error || "Failed");
// 		}
// 	});

// 	return (
// 		<form className='flex flex-col gap-4' onSubmit={onSubmit}>
// 			<h1 className='text-xl font-bold'>Set Academic Fees</h1>
// 			<InputField
// 				label='Fee Name (e.g. Term 1 Tuition)'
// 				name='name'
// 				register={register}
// 			/>
// 			<InputField
// 				label='Amount (GHS)'
// 				name='amount'
// 				type='number'
// 				register={register}
// 			/>

// 			<div className='flex flex-col gap-2'>
// 				<label className='text-xs text-gray-500'>
// 					Class (Optional - Leaves blank for All)
// 				</label>
// 				<select {...register("classId")} className='p-2 border rounded-md'>
// 					<option value=''>All Classes</option>
// 					<option value='1'>Class 1</option>
// 					<option value='2'>Class 2</option>
// 					{/* Ideally fetch these dynamically */}
// 				</select>
// 			</div>

// 			<span className='text-red-500 text-sm'>{msg}</span>
// 			<button className='bg-blue-600 text-white p-2 rounded-md'>Set Fee</button>
// 		</form>
// 	);
// };
// export default FeeForm;
