import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { supabase } from "@/lib/supabase";

const columns = [
	{ header: "Info", accessor: "info" },
	{ header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
	{ header: "Address", accessor: "address", className: "hidden lg:table-cell" },
	{ header: "Actions", accessor: "action" },
];

const ParentListPage = async () => {
	const { data: parents, error } = await supabase
		.from("parents")
		.select("*, users(first_name, last_name, email, phone_number)");

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight'>
			<td className='flex items-center gap-4 p-4'>
				<div className='flex flex-col'>
					<h3 className='font-semibold'>
						{item.users?.first_name} {item.users?.last_name}
					</h3>
					<p className='text-xs text-gray-500'>{item.users?.email}</p>
				</div>
			</td>
			<td className='hidden md:table-cell'>{item.users?.phone_number}</td>
			<td className='hidden md:table-cell'>{item.address}</td>
			<td>
				<div className='flex items-center gap-2'>
					<FormModal table='parent' type='update' data={item} />
					<FormModal table='parent' type='delete' id={item.id} />
				</div>
			</td>
		</tr>
	);

	return (
		<div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
			<div className='flex items-center justify-between'>
				<h1 className='hidden md:block text-lg font-semibold'>All Parents</h1>
				<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
					<TableSearch />
					<div className='flex items-center gap-4 self-end'>
						<FormModal table='parent' type='create' />
					</div>
				</div>
			</div>
			<Table columns={columns} renderRow={renderRow} data={parents || []} />
			<Pagination />
		</div>
	);
};

export default ParentListPage;
