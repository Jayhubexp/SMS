"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createFeeType, updateFeeType } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

const schema = z.object({
	name: z.string().min(1, { message: "Fee type name is required!" }),
	description: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const FeeTypeForm = ({
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
	} = useForm<Inputs>({
		resolver: zodResolver(schema),
		defaultValues: data || {},
	});

	const router = useRouter();
	const [msg, setMsg] = useState("");

	const onSubmit = handleSubmit(async (formData: any) => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("description", formData.description || "");

		let res;
		if (type === "update") {
			payload.append("id", data.id);
			res = await updateFeeType(payload);
		} else {
			res = await createFeeType(payload);
		}

		if (res.success) {
			setOpen(false);
			router.refresh();
		} else {
			setMsg(res.error || "Failed to save fee type");
		}
	});

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<h1 className="text-xl font-bold">
				{type === "create" ? "Create" : "Edit"} Fee Type
			</h1>

			<InputField
				label="Fee Type Name"
				name="name"
				type="text"
				register={register}
				defaultValue={data?.name}
				error={errors.name}
				placeholder="e.g. Academic Fees, Book Fees, Uniforms"
			/>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">Description (Optional)</label>
				<textarea
					{...register("description")}
					className="p-2 border rounded-md"
					placeholder="Describe this fee type"
					defaultValue={data?.description}
					rows={3}
				/>
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

export default FeeTypeForm;
