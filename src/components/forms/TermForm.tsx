"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createTerm, getAcademicYears } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const schema = z.object({
	name: z.string().min(1, { message: "Term name is required!" }),
	academicYearId: z.string().min(1, { message: "Academic year is required!" }),
	startDate: z.string().min(1, { message: "Start date is required!" }),
	endDate: z.string().min(1, { message: "End date is required!" }),
});

type Inputs = z.infer<typeof schema>;

const TermForm = ({
	setOpen,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		resolver: zodResolver(schema),
	});

	const router = useRouter();
	const [msg, setMsg] = useState("");
	const [academicYears, setAcademicYears] = useState<any[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const res = await getAcademicYears();
			if (res.success) {
				setAcademicYears(res.data || []);
			}
		};
		fetchData();
	}, []);

	const onSubmit = handleSubmit(async (formData: any) => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("academicYearId", formData.academicYearId);
		payload.append("startDate", formData.startDate);
		payload.append("endDate", formData.endDate);

		const res = await createTerm(payload);

		if (res.success) {
			setOpen(false);
			router.refresh();
		} else {
			setMsg(res.error || "Failed to create term");
		}
	});

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<h1 className="text-xl font-bold">Create Term</h1>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">Term Name</label>
				<select
					{...register("name")}
					className="p-2 border rounded-md"
					defaultValue="">
					<option value="">Select term</option>
					<option value="Term 1">Term 1</option>
					<option value="Term 2">Term 2</option>
					<option value="Term 3">Term 3</option>
				</select>
				{errors.name && (
					<p className="text-red-500 text-xs">{errors.name.message}</p>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">Academic Year</label>
				<select
					{...register("academicYearId")}
					className="p-2 border rounded-md"
					defaultValue="">
					<option value="">Select academic year</option>
					{academicYears.map((year) => (
						<option key={year.id} value={year.id}>
							{year.name}
						</option>
					))}
				</select>
				{errors.academicYearId && (
					<p className="text-red-500 text-xs">{errors.academicYearId.message}</p>
				)}
			</div>

			<InputField
				label="Start Date"
				name="startDate"
				type="date"
				register={register}
				defaultValue=""
				error={errors.startDate}
			/>

			<InputField
				label="End Date"
				name="endDate"
				type="date"
				register={register}
				defaultValue=""
				error={errors.endDate}
			/>

			{msg && (
				<p className={msg.includes("success") ? "text-green-500" : "text-red-500"}>
					{msg}
				</p>
			)}

			<button
				type="submit"
				className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500">
				Create
			</button>
		</form>
	);
};

export default TermForm;
