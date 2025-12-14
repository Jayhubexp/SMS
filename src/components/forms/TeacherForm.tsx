"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { createUser } from "@/lib/actions"; // We will create this action next
import { useRouter } from "next/navigation";

const schema = z.object({
	username: z
		.string()
		.min(3, { message: "Username must be at least 3 characters long!" })
		.max(20, { message: "Username must be at most 20 characters long!" }),
	email: z.string().email({ message: "Invalid email address!" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long!" }),
	firstName: z.string().min(1, { message: "First name is required!" }),
	lastName: z.string().min(1, { message: "Last name is required!" }),
	phone: z.string().min(1, { message: "Phone is required!" }),
	address: z.string().min(1, { message: "Address is required!" }),
	birthday: z.string().min(1, { message: "Birthday is required!" }),
	sex: z.enum(["male", "female"], { message: "Sex is required!" }),
});

type Inputs = z.infer<typeof schema>;

const TeacherForm = ({
	type,
	data,
	setOpen,
	relatedData,
}: {
	type: "create" | "update";
	data?: any;
	setOpen: Dispatch<SetStateAction<boolean>>;
	relatedData?: any;
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		resolver: zodResolver(schema),
		defaultValues: data || {},
	});

	const [state, setState] = useState<{
		success: boolean;
		error: boolean;
		message?: string;
	}>({
		success: false,
		error: false,
	});

	const router = useRouter();

	const onSubmit = handleSubmit(async (data) => {
		if (type === "create") {
			// FIX: Convert the plain 'data' object into 'FormData'
			const formData = new FormData();

			// Loop through all form fields and append them
			Object.entries(data).forEach(([key, value]) => {
				// Skip undefined values
				if (value !== undefined) {
					formData.append(key, value as string);
				}
			});

			// Pass the converted formData to the Server Action
			const result = await createUser(formData, "teacher");

			if (result.success) {
				setState({ success: true, error: false });
				alert("Teacher created successfully!");
				setOpen(false);
				router.refresh();
			} else {
				setState({
					success: false,
					error: true,
					message:
						typeof result.error === "string"
							? result.error
							: "Failed to create",
				});
				alert("Error: " + result.error);
			}
		} else {
			alert("Update logic not yet implemented");
		}
	});

	return (
		<form className='flex flex-col gap-8' onSubmit={onSubmit}>
			<h1 className='text-xl font-semibold dark:text-dark-text'>
				{type === "create" ? "Create a new teacher" : "Update teacher"}
			</h1>

			<span className='text-xs text-gray-400 dark:text-dark-textSecondary font-medium'>
				Authentication Information
			</span>
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
					inputProps={{
						placeholder:
							type === "update" ? "Leave blank to keep unchanged" : "",
					}}
				/>
			</div>

			<span className='text-xs text-gray-400 dark:text-dark-textSecondary font-medium'>
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
				<InputField
					label='Birthday'
					name='birthday'
					register={register}
					error={errors.birthday}
					type='date'
				/>

				<div className='flex flex-col gap-2 w-full md:w-1/4'>
					<label className='text-xs text-gray-500 dark:text-dark-textSecondary'>
						Sex
					</label>
					<select
						className='ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full'
						{...register("sex")}>
						<option value='male'>Male</option>
						<option value='female'>Female</option>
					</select>
					{errors.sex?.message && (
						<p className='text-xs text-red-400'>
							{errors.sex.message.toString()}
						</p>
					)}
				</div>
			</div>

			{state.error && (
				<span className='text-red-500'>
					Something went wrong! {state.message}
				</span>
			)}

			<button className='bg-blue-400 text-white p-2 rounded-md'>
				{type === "create" ? "Create" : "Update"}
			</button>
		</form>
	);
};

export default TeacherForm;

// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import InputField from "../InputField";
// import Image from "next/image";

// const schema = z.object({
//   username: z
//     .string()
//     .min(3, { message: "Username must be at least 3 characters long!" })
//     .max(20, { message: "Username must be at most 20 characters long!" }),
//   email: z.string().email({ message: "Invalid email address!" }),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long!" }),
//   firstName: z.string().min(1, { message: "First name is required!" }),
//   lastName: z.string().min(1, { message: "Last name is required!" }),
//   phone: z.string().min(1, { message: "Phone is required!" }),
//   address: z.string().min(1, { message: "Address is required!" }),
//   bloodType: z.string().min(1, { message: "Blood Type is required!" }),
//   birthday: z.string().min(1, { message: "Birthday is required!" }), // Changed to string for date input
//   sex: z.enum(["male", "female"], { message: "Sex is required!" }),
//   img: z.any(), // Changed to any to avoid file validation issues in this context
// });

// type Inputs = z.infer<typeof schema>;

// const TeacherForm = ({
//   type,
//   data,
// }: {
//   type: "create" | "update";
//   data?: any;
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<Inputs>({
//     resolver: zodResolver(schema),
//     defaultValues: data || {}, // Pre-populate form if data is provided
//   });

//   const onSubmit = handleSubmit((data) => {
//     console.log(data);
//   });

//   return (
//     <form className="flex flex-col gap-8" onSubmit={onSubmit}>
//       <h1 className="text-xl font-semibold dark:text-dark-text">
//         {type === "create" ? "Create a new teacher" : "Update teacher"}
//       </h1>
//       <span className="text-xs text-gray-400 dark:text-dark-textSecondary font-medium">
//         Authentication Information
//       </span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Username"
//           name="username"
//           register={register}
//           error={errors?.username}
//         />
//         <InputField
//           label="Email"
//           name="email"
//           register={register}
//           error={errors?.email}
//         />
//         <InputField
//           label="Password"
//           name="password"
//           type="password"
//           register={register}
//           error={errors?.password}
//           inputProps={{ placeholder: type === 'update' ? 'Leave blank to keep unchanged' : '' }}
//         />
//       </div>
//       <span className="text-xs text-gray-400 dark:text-dark-textSecondary font-medium">
//         Personal Information
//       </span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="First Name"
//           name="firstName"
//           register={register}
//           error={errors.firstName}
//         />
//         <InputField
//           label="Last Name"
//           name="lastName"
//           register={register}
//           error={errors.lastName}
//         />
//         <InputField
//           label="Phone"
//           name="phone"
//           register={register}
//           error={errors.phone}
//         />
//         <InputField
//           label="Address"
//           name="address"
//           register={register}
//           error={errors.address}
//         />
//         <InputField
//           label="Blood Type"
//           name="bloodType"
//           register={register}
//           error={errors.bloodType}
//         />
//         <InputField
//           label="Birthday"
//           name="birthday"
//           register={register}
//           error={errors.birthday}
//           type="date"
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Sex</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full"
//             {...register("sex")}
//           >
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//           </select>
//           {errors.sex?.message && (
//             <p className="text-xs text-red-400">
//               {errors.sex.message.toString()}
//             </p>
//           )}
//         </div>
//         <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
//           <label
//             className="text-xs text-gray-500 dark:text-dark-textSecondary flex items-center gap-2 cursor-pointer"
//             htmlFor="img"
//           >
//             <Image src="/upload.png" alt="" width={28} height={28} />
//             <span>Upload a photo</span>
//           </label>
//           <input type="file" id="img" {...register("img")} className="hidden" />
//           {errors.img?.message && (
//             <p className="text-xs text-red-400">
//               {errors.img.message.toString()}
//             </p>
//           )}
//         </div>
//       </div>
//       <button className="bg-blue-400 text-white p-2 rounded-md">
//         {type === "create" ? "Create" : "Update"}
//       </button>
//     </form>
//   );
// };

// export default TeacherForm;
