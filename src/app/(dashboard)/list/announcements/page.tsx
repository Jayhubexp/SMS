import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const columns = [
	{
		header: "Title",
		accessor: "title",
	},
	{
		header: "Class",
		accessor: "class",
	},
	{
		header: "Date",
		accessor: "date",
		className: "hidden md:table-cell",
	},
	{
		header: "Actions",
		accessor: "action",
	},
];

const AnnouncementListPage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const { page = "1" } = searchParams;
	const itemsPerPage = 10;
	const offset = (parseInt(page) - 1) * itemsPerPage;

	// FETCH: Get Announcements from Supabase
	// Join with 'classes' to display the class name if applicable
	const {
		data: announcements,
		count,
		error,
	} = await supabaseAdmin
		.from("announcements")
		.select("*, classes(name)", { count: "exact" })
		.order("date", { ascending: false })
		.range(offset, offset + itemsPerPage - 1);

	if (error) {
		console.error("Error fetching announcements:", error);
		return <div className='p-4 text-red-500'>Error loading announcements.</div>;
	}

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
			<td className='flex items-center gap-4 p-4 font-semibold'>
				{item.title}
			</td>
			<td>{item.classes?.name || "All Classes"}</td>
			<td className='hidden md:table-cell'>
				{new Date(item.date).toLocaleDateString()}
			</td>
			<td>
				<div className='flex items-center gap-2'>
					{/* In a Server Component, we can't check client-side role easily for conditional rendering.
             Ideally, your FormModal handles permission internally or you pass a prop.
             For now, we show buttons, and the Server Action will enforce security.
          */}
					<FormModal table='announcement' type='update' data={item} />
					<FormModal table='announcement' type='delete' id={item.id} />
				</div>
			</td>
		</tr>
	);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			{/* TOP */}
			<div className='flex items-center justify-between'>
				<h1 className='hidden md:block text-lg font-semibold dark:text-dark-text'>
					All Announcements
				</h1>
				<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
					<TableSearch />
					<div className='flex items-center gap-4 self-end'>
						<FormModal table='announcement' type='create' />
					</div>
				</div>
			</div>
			{/* LIST */}
			<Table
				columns={columns}
				renderRow={renderRow}
				data={announcements || []}
			/>
			{/* PAGINATION */}
			<Pagination count={count || 0} />
		</div>
	);
};

export default AnnouncementListPage;
