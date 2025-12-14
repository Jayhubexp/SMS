import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const columns = [
	{ header: "Info", accessor: "info" },
	{ header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
	{ header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
	{ header: "Actions", accessor: "action" },
];

const TeacherListPage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	// SIMPLIFIED QUERY:
	// 1. Fetch denormalized columns (first_name, last_name, etc.) directly from 'teachers'
	// 2. Fetch classes via the relationship to 'users' (users:id)
	const { data: teachers, error } = await supabaseAdmin
		.from("teachers")
		.select(
			`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      qualifications,
      users:id (
        classes (name)
      )
    `,
		)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching teachers:", error);
		return (
			<div className='p-4 bg-red-50 text-red-500 rounded'>
				Error loading teachers. Please check database permissions.
			</div>
		);
	}

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
			<td className='flex items-center gap-4 p-4'>
				{/* Static Avatar to avoid missing column errors */}
				<Image
					src='/avatar.png'
					alt=''
					width={40}
					height={40}
					className='md:hidden xl:block w-10 h-10 rounded-full object-cover'
				/>
				<div className='flex flex-col'>
					<h3 className='font-semibold'>
						{item.first_name} {item.last_name}
					</h3>
					<p className='text-xs text-gray-500 dark:text-dark-textSecondary'>
						{item.email}
					</p>
				</div>
			</td>
			<td className='hidden md:table-cell'>
				{/* Classes fetched via the relation */}
				{item.users?.classes && item.users.classes.length > 0
					? item.users.classes.map((c: any) => c.name).join(", ")
					: "No Class"}
			</td>
			<td className='hidden md:table-cell'>{item.phone_number || "N/A"}</td>
			<td>
				<div className='flex items-center gap-2'>
					<Link href={`/list/teachers/${item.id}`}>
						<button className='w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky'>
							<Image src='/view.png' alt='' width={16} height={16} />
						</button>
					</Link>
					<FormModal table='teacher' type='delete' id={item.id} />
				</div>
			</td>
		</tr>
	);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			{/* TOP */}
			<div className='flex items-center justify-between'>
				<h1 className='hidden md:block text-lg font-semibold dark:text-dark-text'>
					All Teachers
				</h1>
				<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
					<TableSearch />
					<div className='flex items-center gap-4 self-end'>
						<button className='w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow'>
							<Image src='/filter.png' alt='' width={14} height={14} />
						</button>
						<button className='w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow'>
							<Image src='/sort.png' alt='' width={14} height={14} />
						</button>
						<FormModal table='teacher' type='create' />
					</div>
				</div>
			</div>
			{/* LIST */}
			<Table columns={columns} renderRow={renderRow} data={teachers || []} />
			{/* PAGINATION */}
			<Pagination />
		</div>
	);
};

export default TeacherListPage;
