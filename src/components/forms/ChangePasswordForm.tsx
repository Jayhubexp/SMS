"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputField from "../InputField";
import { useState } from "react";
import { changePassword } from "@/lib/actions";
import { useRouter } from "next/navigation";

const schema = z
	.object({
		password: z.string().min(6, { message: "Min 6 characters" }),
		confirmPassword: z.string().min(6, { message: "Min 6 characters" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type Inputs = z.infer<typeof schema>;

const ChangePasswordForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		resolver: zodResolver(schema),
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const router = useRouter();

	const onSubmit = handleSubmit(async (data) => {
		setError("");
		const formData = new FormData();
		formData.append("password", data.password);
		formData.append("confirmPassword", data.confirmPassword);

		const res = await changePassword(formData);

		if (res.success) {
			setSuccess(true);
			setTimeout(() => {
				router.push("/"); // Redirect to home/dashboard
				router.refresh();
			}, 2000);
		} else {
			setError(res.error || "Failed to change password");
		}
	});

	if (success) {
		return (
			<div className='text-center p-6 bg-green-50 text-green-700 rounded-lg'>
				<h2 className='text-xl font-bold mb-2'>Success!</h2>
				<p>Your password has been updated. Redirecting...</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={onSubmit}
			className='flex flex-col gap-4 w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg'>
			<h1 className='text-2xl font-bold text-center mb-4'>Change Password</h1>
			<p className='text-sm text-gray-500 text-center mb-6'>
				Please update your password to continue using the system.
			</p>

			<InputField
				label='New Password'
				name='password'
				type='password'
				register={register}
				error={errors.password}
			/>

			<InputField
				label='Confirm Password'
				name='confirmPassword'
				type='password'
				register={register}
				error={errors.confirmPassword}
			/>

			{error && <p className='text-red-500 text-sm text-center'>{error}</p>}

			<button className='bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'>
				Update Password
			</button>
		</form>
	);
};

export default ChangePasswordForm;
