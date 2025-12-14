import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const columns = [
	{ header: "Title", accessor: "title" },
	{ header: "Date", accessor: "date", className: "hidden md:table-cell" },
	{
		header: "Start Time",
		accessor: "startTime",
		className: "hidden md:table-cell",
	},
	{
		header: "End Time",
		accessor: "endTime",
		className: "hidden md:table-cell",
	},
	{ header: "Actions", accessor: "action" },
];

const EventListPage = async () => {
	const {
		data: events,
		count,
		error,
	} = await supabaseAdmin
		.from("events")
		.select("*")
		.order("start_time", { ascending: false });

	if (error)
		return <div className='p-4 text-red-500'>Error loading events.</div>;

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
			<td className='flex items-center gap-4 p-4 font-semibold'>
				{item.title}
			</td>
			<td className='hidden md:table-cell'>
				{new Date(item.start_time).toLocaleDateString()}
			</td>
			<td className='hidden md:table-cell'>
				{new Date(item.start_time).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</td>
			<td className='hidden md:table-cell'>
				{new Date(item.end_time).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</td>
			<td>
				<div className='flex items-center gap-2'>
					<FormModal table='event' type='update' data={item} />
					<FormModal table='event' type='delete' id={item.id} />
				</div>
			</td>
		</tr>
	);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			<div className='flex items-center justify-between'>
				<h1 className='hidden md:block text-lg font-semibold dark:text-dark-text'>
					All Events
				</h1>
				<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
					<TableSearch />
					<div className='flex items-center gap-4 self-end'>
						<FormModal table='event' type='create' />
					</div>
				</div>
			</div>
			<Table columns={columns} renderRow={renderRow} data={events || []} />
			<Pagination count={count || 0} />
		</div>
	);
};

export default EventListPage;
