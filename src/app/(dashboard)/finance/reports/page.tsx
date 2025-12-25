import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Table from "@/components/Table";

const FinanceReportsPage = async () => {
	// Fetch all classes for class-level reporting
	const { data: classes } = await supabaseAdmin
		.from("classes")
		.select("id, name")
		.order("name");

	// Fetch all students for student-level reporting
	const { data: students } = await supabaseAdmin
		.from("students")
		.select("id, student_id, users(first_name, last_name), classes(name)")
		.order("student_id");

	const classColumns = [
		{ header: "Class Name", accessor: "name" },
		{ header: "Action", accessor: "action" },
	];

	const studentColumns = [
		{ header: "Student ID", accessor: "student_id" },
		{ header: "Name", accessor: "name" },
		{ header: "Class", accessor: "class" },
		{ header: "Action", accessor: "action" },
	];

	const classRenderRow = (item: any) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border">
			<td className="p-4 font-semibold">{item.name}</td>
			<td>
				<Link
					href={`/finance/reports/class/${item.id}`}
					className="text-blue-500 hover:underline">
					View Report
				</Link>
			</td>
		</tr>
	);

	const studentRenderRow = (item: any) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border">
			<td className="p-4 font-mono text-xs">{item.student_id}</td>
			<td className="p-4 font-semibold">
				{item.users.first_name} {item.users.last_name}
			</td>
			<td className="p-4">{item.classes?.name || "No Class"}</td>
			<td>
				<Link
					href={`/finance/reports/student/${item.id}`}
					className="text-blue-500 hover:underline">
					View Report
				</Link>
			</td>
		</tr>
	);

	return (
		<div className="flex flex-col gap-4 p-4">
			{/* Class Reports */}
			<div className="bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-xl font-bold dark:text-dark-text">
						Finance Reports by Class
					</h1>
				</div>
				<Table
					columns={classColumns}
					renderRow={classRenderRow}
					data={classes || []}
				/>
			</div>

			{/* Student Reports */}
			<div className="bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-xl font-bold dark:text-dark-text">
						Finance Reports by Student
					</h1>
				</div>
				<Table
					columns={studentColumns}
					renderRow={studentRenderRow}
					data={students || []}
				/>
			</div>
		</div>
	);
};

export default FinanceReportsPage;
