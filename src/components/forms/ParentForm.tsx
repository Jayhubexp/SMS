"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

const schema = z.object({
	username: z
		.string()
		.min(3, { message: "Username must be at least 3 characters!" }),
	email: z.string().email({ message: "Invalid email address!" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters!" }),
	firstName: z.string().min(1, { message: "First name is required!" }),
	lastName: z.string().min(1, { message: "Last name is required!" }),
	phone: z.string().min(1, { message: "Phone is required!" }),
	address: z.string().min(1, { message: "Address is required!" }),
});

type Inputs = z.infer<typeof schema>;

const ParentForm = ({
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
	}>({
		success: false,
		error: false,
	});

	const onSubmit = handleSubmit(async (data) => {
		if (type === "create") {
			const formData = new FormData();
			// Convert plain data object to FormData
			Object.entries(data).forEach(([key, value]) => {
				if (value) formData.append(key, value as string);
			});

			const result = await createUser(formData, "parent");

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
				{type === "create" ? "Create a new parent" : "Update parent"}
			</h1>

			<div className='flex justify-between flex-wrap gap-4'>
				<InputField
					label='Username'
					name='username'
					register={register}
					error={errors?.username}
				/>
				<InputField
					label='Email'
					name='email'
					register={register}
					error={errors?.email}
				/>
				<InputField
					label='Password'
					name='password'
					type='password'
					register={register}
					error={errors?.password}
				/>
			</div>

			<span className='text-xs text-gray-400 font-medium'>
				Personal Information
			</span>
			<div className='flex justify-between flex-wrap gap-4'>
				<InputField
					label='First Name'
					name='firstName'
					register={register}
					error={errors.firstName}
				/>
				<InputField
					label='Last Name'
					name='lastName'
					register={register}
					error={errors.lastName}
				/>
				<InputField
					label='Phone'
					name='phone'
					register={register}
					error={errors.phone}
				/>
				<InputField
					label='Address'
					name='address'
					register={register}
					error={errors.address}
				/>
			</div>

			{state.error && <p className='text-red-500 text-sm'>{state.message}</p>}

			<button className='bg-blue-400 text-white p-2 rounded-md'>
				{type === "create" ? "Create" : "Update"}
			</button>
		</form>
	);
};

export default ParentForm;
