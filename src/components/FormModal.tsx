"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { 
    deleteFeeStructure, 
    deleteReceipt,
    deleteAnnouncement,
    deleteEvent,
    deleteClass,
    deleteFeeType,
    deleteDiscount,
	deleteSubject,
	deleteStudent
} from "@/lib/actions"; 

// Dynamic imports
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
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
	loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
	loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
	loading: () => <h1>Loading...</h1>,
});
const FeeTypeForm = dynamic(() => import("./forms/FeeTypeForm"), {
	loading: () => <h1>Loading...</h1>,
});
const DiscountForm = dynamic(() => import("./forms/DiscountForm"), {
	loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
	loading: () => <h1>Loading...</h1>,
});


// Map tables to delete actions
const deleteActions: { [key: string]: (id: number | string) => Promise<any> } =
	{
		fee: deleteFeeStructure,
		receipt: deleteReceipt,
        announcement: deleteAnnouncement,
        event: deleteEvent,
        class: deleteClass,
        feeType: deleteFeeType,
        discount: deleteDiscount,
		subject: deleteSubject,
		student: deleteStudent,
	};

// Map tables to Forms
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
	fee: (type, data, setOpen) => (
		<FeeForm type={type} data={data} setOpen={setOpen} />
	),
	receipt: (type, data, setOpen) => <ReceiptForm setOpen={setOpen} />,
	announcement: (type, data, setOpen) => (
		<AnnouncementForm type={type} data={data} setOpen={setOpen} />
	),
	event: (type, data, setOpen) => (
		<EventForm type={type} data={data} setOpen={setOpen} />
	),
	class: (type, data, setOpen) => (
		<ClassForm type={type} data={data} setOpen={setOpen} />
	),
	feeType: (type, data, setOpen) => (
		<FeeTypeForm type={type} data={data} setOpen={setOpen} />
	),
	discount: (type, data, setOpen) => (
		<DiscountForm type={type} data={data} setOpen={setOpen} />
	),
	subject: (type, data, setOpen) => (
		<SubjectForm type={type} data={data} setOpen={setOpen} />
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
		| "feeType"
		| "discount"
		| "receipt";
	type: "create" | "update" | "delete" | "view";
	data?: any;
	id?: number;
}) => {
	const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
	const bgColor =
		type === "create"
			? "bg-lamaYellow"
			: type === "update"
			? "bg-lamaSky"
			: type === "delete"
			? "bg-lamaPurple"
            : "bg-gray-200";

	const [open, setOpen] = useState(false);
	const router = useRouter();

	const handleDelete = async (e: React.FormEvent) => {
		e.preventDefault();
		const deleteAction = deleteActions[table];

		if (deleteAction && id) {
			const res = await deleteAction(id);
			if (res.success) {
				setOpen(false);
				router.refresh();
			} else {
				alert(res.error || "Delete failed");
			}
		} else {
			alert(`Delete action for ${table} not implemented yet.`);
		}
	};

	const Form = () => {
        // 1. VIEW MODE
        if (type === "view" && data) {
            return (
                <div className="flex flex-col gap-4 p-4 dark:text-dark-text">
                    <h1 className="text-xl font-bold border-b pb-2">Details</h1>
                    <div>
                        <span className="font-bold text-gray-500 text-xs uppercase">Title / Name</span>
                        <p className="text-lg font-medium">{data.title || data.name || "N/A"}</p>
                    </div>
                    
                    {data.start_time && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-bold text-gray-500 text-xs uppercase">Start</span>
                                <p>{new Date(data.start_time).toLocaleString()}</p>
                            </div>
                            {data.end_time && (
                                <div>
                                    <span className="font-bold text-gray-500 text-xs uppercase">End</span>
                                    <p>{new Date(data.end_time).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <span className="font-bold text-gray-500 text-xs uppercase">Description</span>
                        <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded mt-1 border dark:border-dark-border min-h-[100px]">
                            {data.description || "No description provided."}
                        </div>
                    </div>

                    <button 
                        onClick={() => setOpen(false)}
                        className="bg-blue-600 text-white p-2 rounded-md w-full mt-4"
                    >
                        Close
                    </button>
                </div>
            );
        }

        // 2. DELETE MODE
		if (type === "delete" && id) {
			return (
				<form onSubmit={handleDelete} className='p-4 flex flex-col gap-4'>
					<span className='text-center font-medium dark:text-dark-text'>
						All data will be lost. Are you sure you want to delete this {table}?
					</span>
					<button className='bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center'>
						Delete
					</button>
				</form>
			);
		}

        // 3. CREATE / UPDATE MODE
        if ((type === "create" || type === "update") && forms[table]) {
            return forms[table](type, data, setOpen);
        }

        // 4. FALLBACK
		return (
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