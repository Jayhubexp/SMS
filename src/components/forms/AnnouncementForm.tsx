"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createAnnouncement } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

const schema = z.object({
	title: z.string().min(1, { message: "Title is required!" }),
	description: z.string().min(1, { message: "Description is required!" }),
	classId: z.string().optional(), // Optional: specific class ID
});

type Inputs = z.infer<typeof schema>;

const AnnouncementForm = ({
	type,
	data,
	setOpen,
}: {
	type: "create" | "update";
	data?: any;
	setOpen: Dispatch<SetStateAction<boolean>>;
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
	const [state, setState] = useState<{
		success: boolean;
		error: boolean;
		message?: string;
	}>({ success: false, error: false });

	const onSubmit = handleSubmit(async (data) => {
		if (type === "create") {
			const formData = new FormData();
			formData.append("title", data.title);
			formData.append("description", data.description);
			if (data.classId) formData.append("classId", data.classId);

			const result = await createAnnouncement(formData);

			if (result.success) {
				setOpen(false);
				router.refresh();
			} else {
				setState({
					success: false,
					error: true,
					message: result.error as string,
				});
			}
		}
	});

	return (
		<form className='flex flex-col gap-8' onSubmit={onSubmit}>
			<h1 className='text-xl font-semibold dark:text-dark-text'>
				{type === "create" ? "New Announcement" : "Update Announcement"}
			</h1>

			<div className='flex flex-col gap-4'>
				<InputField
					label='Title'
					name='title'
					register={register}
					error={errors.title}
				/>

				<div className='flex flex-col gap-2 w-full'>
					<label className='text-xs text-gray-500 dark:text-dark-textSecondary'>
						Description
					</label>
					<textarea
						className='ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full'
						{...register("description")}
						rows={4}
					/>
					{errors.description?.message && (
						<p className='text-xs text-red-400'>{errors.description.message}</p>
					)}
				</div>

				{/* Optional: Class Selection if you want to target specific classes */}
			</div>

			{state.error && <p className='text-red-500 text-sm'>{state.message}</p>}
			<button className='bg-blue-400 text-white p-2 rounded-md'>Create</button>
		</form>
	);
};

export default AnnouncementForm;
