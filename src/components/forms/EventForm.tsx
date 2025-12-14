"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

const schema = z.object({
	title: z.string().min(1, { message: "Title is required!" }),
	description: z.string().optional(),
	startTime: z.string().min(1, { message: "Start time is required!" }),
	endTime: z.string().min(1, { message: "End time is required!" }),
});

type Inputs = z.infer<typeof schema>;

const EventForm = ({
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
			if (data.description) formData.append("description", data.description);
			formData.append("startTime", new Date(data.startTime).toISOString());
			formData.append("endTime", new Date(data.endTime).toISOString());

			const result = await createEvent(formData);

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
				{type === "create" ? "Create Event" : "Update Event"}
			</h1>

			<div className='flex flex-col gap-4'>
				<InputField
					label='Title'
					name='title'
					register={register}
					error={errors.title}
				/>

				<div className='flex justify-between gap-4'>
					<InputField
						label='Start Time'
						name='startTime'
						type='datetime-local'
						register={register}
						error={errors.startTime}
					/>
					<InputField
						label='End Time'
						name='endTime'
						type='datetime-local'
						register={register}
						error={errors.endTime}
					/>
				</div>

				<div className='flex flex-col gap-2 w-full'>
					<label className='text-xs text-gray-500 dark:text-dark-textSecondary'>
						Description
					</label>
					<textarea
						className='ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full'
						{...register("description")}
						rows={3}
					/>
				</div>
			</div>

			{state.error && <p className='text-red-500 text-sm'>{state.message}</p>}
			<button className='bg-blue-400 text-white p-2 rounded-md'>Create</button>
		</form>
	);
};

export default EventForm;
