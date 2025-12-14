import Image from "next/image";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Use Admin client for reliable server fetching

const columns = [
	{ header: "Class Name", accessor: "name" },
	{
		header: "Capacity",
		accessor: "capacity",
		className: "hidden md:table-cell",
	},
	{
		header: "Grade Level",
		accessor: "grade",
		className: "hidden md:table-cell",
	},
	{
		header: "Supervisor",
		accessor: "supervisor",
		className: "hidden md:table-cell",
	},
	{ header: "Actions", accessor: "action" },
];

const ClassListPage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const { page = "1" } = searchParams;
	const itemsPerPage = 10;
	const offset = (parseInt(page) - 1) * itemsPerPage;

	// FETCH: Classes + Linked Grade + Linked Supervisor (Teacher)
	// We alias 'users' as 'supervisor' for clarity since it joins on 'teacher_id'
	const {
		data: classes,
		count,
		error,
	} = await supabaseAdmin
		.from("classes")
		.select(
			`
      id,
      name,
      capacity,
      grade_levels (
        name
      ),
      supervisor:users!teacher_id (
        first_name,
        last_name
      )
    `,
			{ count: "exact" },
		)
		.range(offset, offset + itemsPerPage - 1)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching classes:", error);
		return (
			<div className='p-4 bg-red-50 text-red-500 rounded'>
				Error loading classes. Please check database connection.
			</div>
		);
	}

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
			<td className='flex items-center gap-4 p-4 font-semibold'>{item.name}</td>
			<td className='hidden md:table-cell'>{item.capacity}</td>
			<td className='hidden md:table-cell'>
				{item.grade_levels?.name || "N/A"}
			</td>
			<td className='hidden md:table-cell'>
				{item.supervisor ? (
					`${item.supervisor.first_name} ${item.supervisor.last_name}`
				) : (
					<span className='text-gray-400 italic'>Unassigned</span>
				)}
			</td>
			<td>
				<div className='flex items-center gap-2'>
					{/* FormModal handles the UI for updating/deleting */}
					<FormModal table='class' type='update' data={item} />
					<FormModal table='class' type='delete' id={item.id} />
				</div>
			</td>
		</tr>
	);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			{/* TOP */}
			<div className='flex items-center justify-between'>
				<h1 className='hidden md:block text-lg font-semibold dark:text-dark-text'>
					All Classes
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
						<FormModal table='class' type='create' />
					</div>
				</div>
			</div>
			{/* LIST */}
			<Table columns={columns} renderRow={renderRow} data={classes || []} />
			{/* PAGINATION */}
			<Pagination count={count || 0} />
		</div>
	);
};

export default ClassListPage;
