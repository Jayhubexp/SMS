import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import Image from "next/image";

const columns = [
	{ header: "Student", accessor: "student" },
	{ header: "Class", accessor: "class" },
	{ header: "Date", accessor: "date" },
	{ header: "Status", accessor: "status" },
];

const AttendanceListPage = async () => {
	// Fetch recent attendance records
	// Note: This assumes you have data in the 'attendance' table.
	// If not, this will just be empty, which is fine.
	const { data: attendance } = await supabaseAdmin
		.from("attendance")
		.select(
			`
        id,
        date,
        status,
        students (
            users (first_name, last_name)
        ),
        classes (name)
    `,
		)
		.order("date", { ascending: false })
		.limit(20);

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight'>
			<td className='p-4 flex items-center gap-2'>
				{item.students?.users?.first_name} {item.students?.users?.last_name}
			</td>
			<td>{item.classes?.name}</td>
			<td>{new Date(item.date).toLocaleDateString()}</td>
			<td>
				<span
					className={`px-2 py-1 rounded text-xs text-white ${
						item.status === "Present"
							? "bg-green-500"
							: item.status === "Absent"
							? "bg-red-500"
							: "bg-yellow-500"
					}`}>
					{item.status}
				</span>
			</td>
		</tr>
	);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			<div className='flex items-center justify-between mb-4'>
				<h1 className='hidden md:block text-lg font-semibold dark:text-dark-text'>
					Attendance Records
				</h1>
				<div className='flex gap-4'>
					{/* Link to the Print Page we just created */}
					<Link href='/list/attendance/print'>
						<button className='bg-lamaYellow hover:bg-yellow-200 text-black px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium'>
							<Image src='/attendance.png' alt='' width={16} height={16} />
							Print Register
						</button>
					</Link>
					<TableSearch />
				</div>
			</div>
			<Table columns={columns} renderRow={renderRow} data={attendance || []} />
			<Pagination />
		</div>
	);
};

export default AttendanceListPage;

// ... inside SecretaryPage return ...

{
	/* PRINT ATTENDANCE */
}
<Link href='/list/attendance/print' className='w-full md:w-auto'>
	<button className='w-full md:w-auto flex items-center gap-2 p-3 rounded-md bg-lamaYellowLight dark:bg-yellow-800 dark:text-dark-text hover:bg-lamaYellow transition-colors'>
		<Image
			src='/attendance.png'
			alt='Print Attendance'
			width={20}
			height={20}
		/>
		Print Attendance Register
	</button>
</Link>;
