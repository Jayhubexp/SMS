"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import {
	createClass,
	updateClass,
	getTeachersForDropdown,
	getGradeLevelsForDropdown,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
	name: z.string().min(1, { message: "Class name is required!" }),
	capacity: z
		.string()
		.refine((val) => !isNaN(parseInt(val)), {
			message: "Capacity must be a number!",
		})
		.refine((val) => parseInt(val) > 0, {
			message: "Capacity must be greater than 0!",
		}),
	gradeId: z.string().min(1, { message: "Grade level is required!" }),
	teacherId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const ClassForm = ({
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
	const { role } = useAuth();
	const [msg, setMsg] = useState("");
	const [teachers, setTeachers] = useState<any[]>([]);
	const [grades, setGrades] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Check access control
	useEffect(() => {
			if (
				role &&
				!["managing_director", "secretary", "system_administrator"].includes(role)
			) {
			setMsg("You do not have permission to manage classes.");
			setLoading(false);
			return;
		}

		const fetchData = async () => {
			try {
				const [teachersRes, gradesRes] = await Promise.all([
					getTeachersForDropdown(),
					getGradeLevelsForDropdown(),
				]);

				if (teachersRes.success) {
					setTeachers(teachersRes.data || []);
				}
				if (gradesRes.success) {
					setGrades(gradesRes.data || []);
				}
			} catch (error) {
				console.error("Error fetching form data:", error);
				setMsg("Failed to load form data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [role]);

	const onSubmit = handleSubmit(async (formData: any) => {
		const payload = new FormData();
		payload.append("name", formData.name);
		payload.append("capacity", formData.capacity);
		payload.append("gradeId", formData.gradeId);
		if (formData.teacherId) {
			payload.append("teacherId", formData.teacherId);
		}

		let res;
		if (type === "update") {
			payload.append("id", data.id);
			res = await updateClass(payload);
		} else {
			res = await createClass(payload);
		}

		if (res.success) {
			setOpen(false);
			router.refresh();
		} else {
			setMsg(res.error || "Failed to save class");
		}
	});

	if (loading) {
		return <div className="p-4">Loading...</div>;
	}

	if (msg && msg.includes("permission")) {
		return <div className="p-4 bg-red-50 text-red-500 rounded">{msg}</div>;
	}

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<h1 className="text-xl font-bold">
				{type === "create" ? "Create" : "Edit"} Class
			</h1>

			<InputField
				label="Class Name"
				name="name"
				type="text"
				register={register}
				defaultValue={data?.name}
				error={errors.name}
			/>

			<InputField
				label="Capacity"
				name="capacity"
				type="number"
				register={register}
				defaultValue={data?.capacity}
				error={errors.capacity}
			/>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">Grade Level</label>
				<select
					{...register("gradeId")}
					className="p-2 border rounded-md"
					defaultValue={data?.grade_levels?.id || ""}>
					<option value="">Select a grade level</option>
					{grades.map((grade) => (
						<option key={grade.id} value={grade.id}>
							{grade.name}
						</option>
					))}
				</select>
				{errors.gradeId && (
					<p className="text-red-500 text-xs">{errors.gradeId.message}</p>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<label className="text-xs text-gray-500">Supervisor (Teacher)</label>
				<select
					{...register("teacherId")}
					className="p-2 border rounded-md"
					defaultValue={data?.supervisor?.id || ""}>
					<option value="">Select a teacher (optional)</option>
					{teachers.map((teacher) => (
						<option key={teacher.id} value={teacher.id}>
							{teacher.first_name} {teacher.last_name}
						</option>
					))}
				</select>
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

export default ClassForm;
