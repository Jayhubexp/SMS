"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createAcademicYear } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

const schema = z.object({
	name: z.string().min(1, { message: "Academic year name is required!" }),
	startDate: z.string().min(1, { message: "Start date is required!" }),
	endDate: z.string().min(1, { message: "End date is required!" }),
});

type Inputs = z.infer<typeof schema>;

const AcademicYearForm = ({
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

	const onSubmit = handleSubmit(async (formData: any) => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("startDate", formData.startDate);
		payload.append("endDate", formData.endDate);

		const res = await createAcademicYear(payload);

		if (res.success) {
			setOpen(false);
			router.refresh();
		} else {
			setMsg(res.error || "Failed to create academic year");
		}
	});

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<h1 className="text-xl font-bold">Create Academic Year</h1>

			<InputField
				label="Academic Year Name"
				name="name"
				type="text"
				register={register}
				defaultValue=""
				error={errors.name}
				placeholder="e.g. 2024/2025"
			/>

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

export default AcademicYearForm;
