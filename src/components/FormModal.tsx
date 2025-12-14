"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, Dispatch, SetStateAction } from "react";

// Dynamic imports to load forms only when needed

const FeeForm = dynamic(() => import("./forms/FeeForm"), {
	loading: () => <h1>Loading...</h1>,
});
const ReceiptForm = dynamic(() => import("./forms/ReceiptForm"), {
	loading: () => <h1>Loading...</h1>,
});

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
	loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
	loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
	loading: () => <h1>Loading...</h1>,
});
// Ensure you create these files or comment them out if not ready
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
	loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
	loading: () => <h1>Loading...</h1>,
});

const forms: {
	[key: string]: (
		type: "create" | "update",
		data: any,
		setOpen: Dispatch<SetStateAction<boolean>>,
	) => JSX.Element;
} = {
	teacher: (type, data, setOpen) => (
		<TeacherForm type={type} data={data} setOpen={setOpen} />
	),
	student: (type, data, setOpen) => (
		<StudentForm type={type} data={data} setOpen={setOpen} />
	),
	parent: (type, data, setOpen) => (
		<ParentForm type={type} data={data} setOpen={setOpen} />
	),

	fee: (type, data, setOpen) => <FeeForm setOpen={setOpen} />,
	receipt: (type, data, setOpen) => <ReceiptForm setOpen={setOpen} />,
	announcement: (type, data, setOpen) => (
		<AnnouncementForm type={type} data={data} setOpen={setOpen} />
	),
	event: (type, data, setOpen) => (
		<EventForm type={type} data={data} setOpen={setOpen} />
	),
};

const FormModal = ({
	table,
	type,
	data,
	id,
}: {
	table:
		| "teacher"
		| "student"
		| "parent"
		| "subject"
		| "class"
		| "lesson"
		| "exam"
		| "assignment"
		| "result"
		| "attendance"
		| "event"
		| "announcement"
		| "fee"
		| "receipt";
	type: "create" | "update" | "delete";
	data?: any;
	id?: number;
}) => {
	const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
	const bgColor =
		type === "create"
			? "bg-lamaYellow"
			: type === "update"
			? "bg-lamaSky"
			: "bg-lamaPurple";

	const [open, setOpen] = useState(false);

	const Form = () => {
		return type === "delete" && id ? (
			<form action='' className='p-4 flex flex-col gap-4'>
				<span className='text-center font-medium dark:text-dark-text'>
					All data will be lost. Are you sure you want to delete this {table}?
				</span>
				<button className='bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center'>
					Delete
				</button>
			</form>
		) : (type === "create" || type === "update") && forms[table] ? (
			// PASSING SETOPEN HERE FIXES YOUR ERROR
			forms[table](type, data, setOpen)
		) : (
			<div className='p-4 dark:text-dark-text'>
				Form not found for table: {table}
			</div>
		);
	};

	return (
		<>
			<button
				className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
				onClick={() => setOpen(true)}>
				<Image src={`/${type}.png`} alt='' width={16} height={16} />
			</button>
			{open && (
				<div className='w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center'>
					<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto'>
						<Form />
						<div
							className='absolute top-4 right-4 cursor-pointer'
							onClick={() => setOpen(false)}>
							<Image src='/close.png' alt='' width={14} height={14} />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default FormModal;
