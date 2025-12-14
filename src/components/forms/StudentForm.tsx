"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createUser, getClasses } from "@/lib/actions"; // 1. Import getClasses
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // 2. Import useEffect

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  birthday: z.string().min(1, { message: "Birthday is required!" }),
  sex: z.enum(["Male", "Female"], { message: "Sex is required!" }), // Case sensitive matches DB check constraint
  classId: z.string().optional(), // 3. Changed from gradeId to classId
});

type Inputs = z.infer<typeof schema>;

const StudentForm = ({
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
  const [state, setState] = useState({
    success: false,
    error: false,
    message: "",
  });
  
  // 4. State for classes
  const [classes, setClasses] = useState<any[]>([]);

  // 5. Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      const res = await getClasses();
      if (res.success) {
        setClasses(res.data);
      }
    };
    fetchClasses();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    if (type === "create") {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value && key !== "img") formData.append(key, value as string);
      });

      const result = await createUser(formData, "student");

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
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold dark:text-dark-text">
        {type === "create" ? "Create a new student" : "Update student"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors?.password}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          register={register}
          error={errors.firstName}
        />
        <InputField
          label="Last Name"
          name="lastName"
          register={register}
          error={errors.lastName}
        />
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
        />
        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          register={register}
          error={errors.birthday}
        />

        {/* 6. Updated Class Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && <p className="text-red-500 text-sm">{state.message}</p>}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;


// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import InputField from "../InputField";
// import Image from "next/image";
// import { createUser } from "@/lib/actions"; // Import Action
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// const schema = z.object({
// 	username: z
// 		.string()
// 		.min(3, { message: "Username must be at least 3 characters long!" }),
// 	email: z.string().email({ message: "Invalid email address!" }),
// 	password: z
// 		.string()
// 		.min(8, { message: "Password must be at least 8 characters long!" }),
// 	firstName: z.string().min(1, { message: "First name is required!" }),
// 	lastName: z.string().min(1, { message: "Last name is required!" }),
// 	phone: z.string().min(1, { message: "Phone is required!" }),
// 	address: z.string().min(1, { message: "Address is required!" }),
// 	birthday: z.string().min(1, { message: "Birthday is required!" }),
// 	sex: z.enum(["male", "female"], { message: "Sex is required!" }),
// 	gradeId: z.string().optional(), // For Grade selection
// });

// type Inputs = z.infer<typeof schema>;

// const StudentForm = ({
// 	type,
// 	data,
// 	setOpen,
// }: {
// 	type: "create" | "update";
// 	data?: any;
// 	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
// 	const {
// 		register,
// 		handleSubmit,
// 		formState: { errors },
// 	} = useForm<Inputs>({
// 		resolver: zodResolver(schema),
// 		defaultValues: data || {},
// 	});

// 	const router = useRouter();
// 	const [state, setState] = useState({
// 		success: false,
// 		error: false,
// 		message: "",
// 	});

// 	const onSubmit = handleSubmit(async (data) => {
// 		if (type === "create") {
// 			const formData = new FormData();
// 			Object.entries(data).forEach(([key, value]) => {
// 				if (value && key !== "img") formData.append(key, value as string);
// 			});

// 			const result = await createUser(formData, "student");

// 			if (result.success) {
// 				setOpen(false);
// 				router.refresh();
// 			} else {
// 				setState({
// 					success: false,
// 					error: true,
// 					message: result.error as string,
// 				});
// 			}
// 		}
// 	});

// 	return (
// 		<form className='flex flex-col gap-8' onSubmit={onSubmit}>
// 			<h1 className='text-xl font-semibold dark:text-dark-text'>
// 				{type === "create" ? "Create a new student" : "Update student"}
// 			</h1>

// 			<div className='flex justify-between flex-wrap gap-4'>
// 				<InputField
// 					label='Username'
// 					name='username'
// 					register={register}
// 					error={errors?.username}
// 				/>
// 				<InputField
// 					label='Email'
// 					name='email'
// 					register={register}
// 					error={errors?.email}
// 				/>
// 				<InputField
// 					label='Password'
// 					name='password'
// 					type='password'
// 					register={register}
// 					error={errors?.password}
// 				/>
// 			</div>

// 			<span className='text-xs text-gray-400 font-medium'>
// 				Personal Information
// 			</span>
// 			<div className='flex justify-between flex-wrap gap-4'>
// 				<InputField
// 					label='First Name'
// 					name='firstName'
// 					register={register}
// 					error={errors.firstName}
// 				/>
// 				<InputField
// 					label='Last Name'
// 					name='lastName'
// 					register={register}
// 					error={errors.lastName}
// 				/>
// 				<InputField
// 					label='Phone'
// 					name='phone'
// 					register={register}
// 					error={errors.phone}
// 				/>
// 				<InputField
// 					label='Address'
// 					name='address'
// 					register={register}
// 					error={errors.address}
// 				/>
// 				<InputField
// 					label='Birthday'
// 					name='birthday'
// 					type='date'
// 					register={register}
// 					error={errors.birthday}
// 				/>

// 				{/* Grade Selection (Simplified) */}
// 				<div className='flex flex-col gap-2 w-full md:w-1/4'>
// 					<label className='text-xs text-gray-500'>Grade</label>
// 					<select
// 						className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
// 						{...register("gradeId")}>
// 						<option value=''>Select Grade</option>
// 						<option value='1'>Grade 1</option>
// 						<option value='2'>Grade 2</option>
// 						{/* Ideally fetch these from DB */}
// 					</select>
// 				</div>

// 				<div className='flex flex-col gap-2 w-full md:w-1/4'>
// 					<label className='text-xs text-gray-500'>Sex</label>
// 					<select
// 						className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
// 						{...register("sex")}>
// 						<option value='male'>Male</option>
// 						<option value='female'>Female</option>
// 					</select>
// 				</div>
// 			</div>

// 			{state.error && <p className='text-red-500 text-sm'>{state.message}</p>}

// 			<button className='bg-blue-400 text-white p-2 rounded-md'>
// 				{type === "create" ? "Create" : "Update"}
// 			</button>
// 		</form>
// 	);
// };

// export default StudentForm;
