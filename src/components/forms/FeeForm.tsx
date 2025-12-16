"use client";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { 
  createFeeStructure, 
  updateFeeStructure, 
  getFeeFormData 
} from "@/lib/actions"; 
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

const FeeForm = ({
	setOpen,
	type,
	data,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>;
	type?: "create" | "update";
	data?: any;
}) => {
	const { register, handleSubmit, watch } = useForm({ defaultValues: data });
	const router = useRouter();
	const [msg, setMsg] = useState("");
	const [classes, setClasses] = useState<any[]>([]);
	const [academicYears, setAcademicYears] = useState<any[]>([]);

	// Watch the name field to conditionally show Class assignment
	const feeName = watch("name");

	useEffect(() => {
		const fetchData = async () => {
			const res = await getFeeFormData();
			if (res.success) {
				setClasses(res.classes);
				setAcademicYears(res.academicYears);
			}
		};
		fetchData();
	}, []);

	const onSubmit = handleSubmit(async (formData: any) => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("amount", formData.amount);
		
		// Only append classId if it was selected (i.e., for Academic Fees)
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
		} else {
			setMsg(res.error || "Failed");
		}
	});

	return (
		<form className='flex flex-col gap-4' onSubmit={onSubmit}>
			<h1 className='text-xl font-bold'>
				{type === "create" ? "Create" : "Edit"} Fee Structure
			</h1>

			{/* Fee Name - Restricted to specific types */}
			<div className='flex flex-col gap-2'>
				<label className='text-xs text-gray-500'>Fee Structure Name</label>
				<select
					{...register("name")}
					className='p-2 border rounded-md'
					defaultValue={data?.name}>
					<option value='Academic Fees'>Academic Fees</option>
					<option value='Book Fees'>Book Fees</option>
					<option value='Souvenirs'>Souvenirs</option>
				</select>
			</div>
			
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

			{/* Class Selection - CONDITIONAL */}
			{/* Only show if "Academic Fees" is selected */}
			{feeName === "Academic Fees" && (
				<div className='flex flex-col gap-2'>
					<label className='text-xs text-gray-500'>
						Assign to Class (Optional)
					</label>
					<select {...register("classId")} className='p-2 border rounded-md'>
						<option value=''>All Classes</option>
						{classes.map((cls) => (
							<option key={cls.id} value={cls.id}>
								{cls.name}
							</option>
						))}
					</select>
					<p className='text-[10px] text-gray-400'>
						Other fee types must be assigned individually to students.
					</p>
				</div>
			)}

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
// import { 
//   createFeeStructure, 
//   updateFeeStructure, 
//   getFeeFormData // 1. Import the new action
// } from "@/lib/actions"; 
// import { useRouter } from "next/navigation";
// import { Dispatch, SetStateAction, useState, useEffect } from "react";
// // Remove: import { supabase } from "@/lib/supabase"; 

// const FeeForm = ({
// 	setOpen,
// 	type,
// 	data,
// }: {
// 	setOpen: Dispatch<SetStateAction<boolean>>;
// 	type?: "create" | "update";
// 	data?: any;
// }) => {
// 	const { register, handleSubmit } = useForm({ defaultValues: data });
// 	const router = useRouter();
// 	const [msg, setMsg] = useState("");
// 	const [classes, setClasses] = useState<any[]>([]);
// 	const [academicYears, setAcademicYears] = useState<any[]>([]);

// 	// 2. Update fetch logic to use Server Action
// 	useEffect(() => {
// 		const fetchData = async () => {
//             // This runs on the server (via the action) effectively bypassing RLS
// 			const res = await getFeeFormData();
// 			if (res.success) {
// 				setClasses(res.classes);
// 				setAcademicYears(res.academicYears);
// 			}
// 		};
// 		fetchData();
// 	}, []);

// 	const onSubmit = handleSubmit(async (formData: any) => {
// 		const payload = new FormData();
// 		payload.append("name", formData.name);
// 		payload.append("amount", formData.amount);
// 		if (formData.classId) payload.append("classId", formData.classId);
// 		if (formData.academicYearId)
// 			payload.append("academicYearId", formData.academicYearId);

// 		let res;
// 		if (type === "update") {
// 			payload.append("id", data.id);
// 			res = await updateFeeStructure(payload);
// 		} else {
// 			res = await createFeeStructure(payload);
// 		}

// 		if (res.success) {
// 			setOpen(false);
// 			router.refresh();
// 			// alert(`Fee Structure ${type === "create" ? "Created" : "Updated"}!`);
// 		} else {
// 			setMsg(res.error || "Failed");
// 		}
// 	});

// 	return (
// 		<form className='flex flex-col gap-4' onSubmit={onSubmit}>
// 			<h1 className='text-xl font-bold'>
// 				{type === "create" ? "Create" : "Edit"} Fee Structure
// 			</h1>

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
// 				defaultValue={data?.fee_items?.[0]?.amount}
// 			/>

// 			{/* Academic Year Selection */}
// 			<div className='flex flex-col gap-2'>
// 				<label className='text-xs text-gray-500'>Academic Year</label>
// 				<select
// 					{...register("academicYearId")}
// 					className='p-2 border rounded-md'
// 					required
// 					defaultValue={data?.academic_year_id}>
// 					<option value=''>Select Academic Year</option>
// 					{academicYears.map((year) => (
// 						<option key={year.id} value={year.id}>
// 							{year.name}
// 						</option>
// 					))}
// 				</select>
// 			</div>

// 			{/* Class Selection */}
// 			<div className='flex flex-col gap-2'>
// 				<label className='text-xs text-gray-500'>
// 					Class (Leave blank for All Classes)
// 				</label>
// 				<select {...register("classId")} className='p-2 border rounded-md'>
// 					<option value=''>All Classes</option>
// 					{classes.map((cls) => (
// 						<option key={cls.id} value={cls.id}>
// 							{cls.name}
// 						</option>
// 					))}
// 				</select>
// 			</div>

// 			<span className='text-red-500 text-sm'>{msg}</span>
// 			<button className='bg-blue-600 text-white p-2 rounded-md'>
// 				{type === "create" ? "Create" : "Update"}
// 			</button>
// 		</form>
// 	);
// };
// export default FeeForm;

// // "use client";
// // import { useForm } from "react-hook-form";
// // import InputField from "../InputField";
// // import { createFeeStructure, updateFeeStructure } from "@/lib/actions"; // Ensure updateFeeStructure is exported in actions
// // import { useRouter } from "next/navigation";
// // import { Dispatch, SetStateAction, useState, useEffect } from "react";
// // import { supabase } from "@/lib/supabase";

// // const FeeForm = ({
// // 	setOpen,
// // 	type,
// // 	data,
// // }: {
// // 	setOpen: Dispatch<SetStateAction<boolean>>;
// // 	type?: "create" | "update";
// // 	data?: any;
// // }) => {
// // 	const { register, handleSubmit } = useForm({ defaultValues: data });
// // 	const router = useRouter();
// // 	const [msg, setMsg] = useState("");
// // 	const [classes, setClasses] = useState<any[]>([]);
// // 	const [academicYears, setAcademicYears] = useState<any[]>([]);

// // 	// Fetch Classes and Academic Years on mount
// // 	useEffect(() => {
// // 		const fetchData = async () => {
// // 			const { data: cls } = await supabase.from("classes").select("id, name");
// // 			const { data: years } = await supabase
// // 				.from("academic_years")
// // 				.select("id, name");
// // 			if (cls) setClasses(cls);
// // 			if (years) setAcademicYears(years);
// // 		};
// // 		fetchData();
// // 	}, []);

// // 	const onSubmit = handleSubmit(async (formData: any) => {
// // 		const payload = new FormData();
// // 		payload.append("name", formData.name);
// // 		payload.append("amount", formData.amount);
// // 		if (formData.classId) payload.append("classId", formData.classId);
// // 		if (formData.academicYearId)
// // 			payload.append("academicYearId", formData.academicYearId);

// // 		let res;
// // 		if (type === "update") {
// // 			payload.append("id", data.id);
// // 			res = await updateFeeStructure(payload);
// // 		} else {
// // 			res = await createFeeStructure(payload);
// // 		}

// // 		if (res.success) {
// // 			setOpen(false);
// // 			router.refresh();
// // 			alert(`Fee Structure ${type === "create" ? "Created" : "Updated"}!`);
// // 		} else {
// // 			setMsg(res.error || "Failed");
// // 		}
// // 	});

// // 	return (
// // 		<form className='flex flex-col gap-4' onSubmit={onSubmit}>
// // 			<h1 className='text-xl font-bold'>
// // 				{type === "create" ? "Create" : "Edit"} Fee Structure
// // 			</h1>

// // 			<InputField
// // 				label='Fee Name (e.g. Term 1 Tuition)'
// // 				name='name'
// // 				register={register}
// // 			/>
// // 			{/* For Edit, show amount from first item if data structure allows, or refetch */}
// // 			<InputField
// // 				label='Amount (GHS)'
// // 				name='amount'
// // 				type='number'
// // 				register={register}
// // 				defaultValue={data?.fee_items?.[0]?.amount}
// // 			/>

// // 			{/* Academic Year Selection */}
// // 			<div className='flex flex-col gap-2'>
// // 				<label className='text-xs text-gray-500'>Academic Year</label>
// // 				<select
// // 					{...register("academicYearId")}
// // 					className='p-2 border rounded-md'
// // 					required
// // 					defaultValue={data?.academic_year_id}>
// // 					<option value=''>Select Academic Year</option>
// // 					{academicYears.map((year) => (
// // 						<option key={year.id} value={year.id}>
// // 							{year.name}
// // 						</option>
// // 					))}
// // 				</select>
// // 			</div>

// // 			{/* Class Selection */}
// // 			<div className='flex flex-col gap-2'>
// // 				<label className='text-xs text-gray-500'>
// // 					Class (Leave blank for All Classes)
// // 				</label>
// // 				<select {...register("classId")} className='p-2 border rounded-md'>
// // 					<option value=''>All Classes</option>
// // 					{classes.map((cls) => (
// // 						<option key={cls.id} value={cls.id}>
// // 							{cls.name}
// // 						</option>
// // 					))}
// // 				</select>
// // 			</div>

// // 			<span className='text-red-500 text-sm'>{msg}</span>
// // 			<button className='bg-blue-600 text-white p-2 rounded-md'>
// // 				{type === "create" ? "Create" : "Update"}
// // 			</button>
// // 		</form>
// // 	);
// // };
// // export default FeeForm;

