"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import InputField from "@/components/InputField";
import Image from "next/image";

const schema = z.object({
	email: z.string().email({ message: "Invalid email address!" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters!" }),
});

type Inputs = z.infer<typeof schema>;

const LoginPage = () => {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		resolver: zodResolver(schema),
	});

	const onSubmit = handleSubmit(async (data) => {
		setLoading(true);
		setError(null);

		try {
			// 1. Authenticate with Supabase
			const { data: sessionData, error: authError } =
				await supabase.auth.signInWithPassword({
					email: data.email,
					password: data.password,
				});

			if (authError) throw authError;

			if (!sessionData.user) throw new Error("No user returned from sign in");

			// 2. Fetch User Role to determine redirect path
			const { data: roleData, error: roleError } = await supabase
				.from("user_roles")
				.select("roles(name)")
				.eq("user_id", sessionData.user.id)
				.single();

			if (roleError) {
				console.error("Error fetching role:", roleError);
			}

			// Extract Role Name Safely
			// @ts-ignore
			const roleName = roleData?.roles?.name || roleData?.roles?.[0]?.name;
			const userRole = roleName ? roleName.toLowerCase() : "student";

			// 3. Map Role to Dashboard URL
			const dashboardMap: Record<string, string> = {
				managing_director: "/managing-director",
				secretary: "/secretary",
				system_administrator: "/system-administrator",
				teacher: "/teacher",
				student: "/student",
				parent: "/parent",
			};

			const targetPath = dashboardMap[userRole] || "/student";

			// 4. Refresh router to update server components/middleware with new cookie
			router.refresh();

			// 5. Redirect to Dashboard (Bypassing forced password change check for now)
			router.replace(targetPath);
		} catch (err: any) {
			console.error("Login failed:", err);
			setError(err.message || "Invalid credentials. Please try again.");
			setLoading(false);
		}
	});

	return (
		<div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white'>
			<div className='bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-blue-100'>
				<div className='flex flex-col items-center mb-8'>
					<div className='w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-blue-50'>
						<Image
							src='/logo.jpg'
							alt='Logo'
							width={80}
							height={80}
							className='object-cover'
						/>
					</div>
					<h2 className='text-3xl font-bold text-blue-950'>Welcome Back</h2>
					<p className='text-slate-500'>Sign in to your dashboard</p>
				</div>

				<form onSubmit={onSubmit} className='flex flex-col gap-5'>
					<InputField
						label='Email Address'
						name='email'
						register={register}
						error={errors.email}
					/>
					<InputField
						label='Password'
						name='password'
						type='password'
						register={register}
						error={errors.password}
					/>

					{error && (
						<div className='p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2'>
							<span className='block w-2 h-2 bg-red-500 rounded-full' />
							{error}
						</div>
					)}

					<button
						disabled={loading}
						className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2'>
						{loading ? "Verifying..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;

// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { supabase } from "@/lib/supabase";
// import InputField from "@/components/InputField";
// import Image from "next/image";

// const schema = z.object({
// 	email: z.string().email({ message: "Invalid email address!" }),
// 	password: z
// 		.string()
// 		.min(6, { message: "Password must be at least 6 characters!" }),
// });

// type Inputs = z.infer<typeof schema>;

// const LoginPage = () => {
// 	const router = useRouter();
// 	const [error, setError] = useState<string | null>(null);
// 	const [loading, setLoading] = useState(false);

// 	const {
// 		register,
// 		handleSubmit,
// 		formState: { errors },
// 	} = useForm<Inputs>({
// 		resolver: zodResolver(schema),
// 	});

// 	const onSubmit = handleSubmit(async (data) => {
// 		setLoading(true);
// 		setError(null);

// 		try {
// 			// 1. Authenticate the user
// 			const { data: sessionData, error: authError } =
// 				await supabase.auth.signInWithPassword({
// 					email: data.email,
// 					password: data.password,
// 				});

// 			if (authError) throw authError;

// 			const user = sessionData.user;

// 			// 2. Fetch user role
// 			// We perform this check to know WHERE to send them,
// 			// but the middleware will double-check permission.
// 			const { data: roleData, error: roleError } = await supabase
// 				.from("user_roles")
// 				.select("roles(name)")
// 				.eq("user_id", user.id)
// 				.single();

// 			if (roleError) {
// 				console.error("Role fetch error:", roleError);
// 				// Don't throw, just default to student to allow entry
// 			}

// 			// Extract Role Name Safely
// 			// @ts-ignore
// 			const roleName = roleData?.roles?.name || roleData?.roles?.[0]?.name;
// 			const userRole = roleName ? roleName.toLowerCase() : "student";

// 			// 3. Role → Route mapping
// 			const roleMap: Record<string, string> = {
// 				admin: "/admin",
// 				teacher: "/teacher",
// 				parent: "/parent",
// 				managing_director: "/managing-director",
// 				system_administrator: "/system-administrator",
// 				secretary: "/secretary",
// 				student: "/student",
// 			};

// 			const targetPath = roleMap[userRole] || "/student";

// 			// 4. THE CRITICAL FIX: Refresh before redirect
// 			// This ensures the middleware sees the new cookie
// 			router.refresh();
// 			router.replace(targetPath);
// 		} catch (err: any) {
// 			console.error("Login failed:", err);
// 			setError(err.message || "Invalid credentials. Please try again.");
// 			setLoading(false);
// 		}
// 	});

// 	return (
// 		<div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white'>
// 			<div className='bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-blue-100'>
// 				<div className='flex flex-col items-center mb-8'>
// 					<div className='w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-blue-50'>
// 						<Image
// 							src='/logo.jpg'
// 							alt='Logo'
// 							width={80}
// 							height={80}
// 							className='object-cover'
// 						/>
// 					</div>
// 					<h2 className='text-3xl font-bold text-blue-950'>Welcome Back</h2>
// 					<p className='text-slate-500'>Sign in to your dashboard</p>
// 				</div>

// 				<form onSubmit={onSubmit} className='flex flex-col gap-5'>
// 					<InputField
// 						label='Email Address'
// 						name='email'
// 						register={register}
// 						error={errors.email}
// 					/>
// 					<InputField
// 						label='Password'
// 						name='password'
// 						type='password'
// 						register={register}
// 						error={errors.password}
// 					/>

// 					{error && (
// 						<div className='p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2'>
// 							<span className='block w-2 h-2 bg-red-500 rounded-full' />
// 							{error}
// 						</div>
// 					)}

// 					<button
// 						disabled={loading}
// 						className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2'>
// 						{loading ? "Verifying..." : "Sign In"}
// 					</button>
// 				</form>
// 			</div>
// 		</div>
// 	);
// };

// export default LoginPage;
