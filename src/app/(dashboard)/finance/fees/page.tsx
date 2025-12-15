import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AssignFeeButton from "@/components/AssignFeeButton";
const columns = [
	{ header: "Structure Name", accessor: "name" },
	{ header: "Academic Year", accessor: "academicYear" },
	{ header: "Total Amount (GHS)", accessor: "amount" },
	{ header: "Actions", accessor: "action" },
];

const FeeStructurePage = async () => {
	const { data: fees } = await supabaseAdmin.from("fee_structures").select(`
      id,
      name,
      academic_year_id,
      academic_years(name),
      fee_items(amount)
    `);

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight'>
			<td className='p-4 font-semibold'>{item.name}</td>
			<td className='hidden md:table-cell'>
				{item.academic_years?.name || "N/A"}
			</td>
			<td className='font-bold text-green-600'>
				GHS{" "}
				{item.fee_items
					?.reduce((sum: number, i: any) => sum + i.amount, 0)
					.toFixed(2)}
			</td>
			<td>
				<div className='flex items-center gap-2'>
					{/* Edit Button */}
					<FormModal table='fee' type='update' data={item} />
					{/* Delete Button */}
					<FormModal table='fee' type='delete' id={item.id} />
					<AssignFeeButton feeId={item.id} classId={item.class_id} />
				</div>
			</td>
		</tr>
	);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			<div className='flex items-center justify-between mb-4'>
				<h1 className='text-xl font-bold dark:text-dark-text'>
					Fee Structures
				</h1>
				<FormModal table='fee' type='create' />
			</div>
			<Table columns={columns} renderRow={renderRow} data={fees || []} />
		</div>
	);
};

export default FeeStructurePage;

// import FormModal from "@/components/FormModal";
// import Table from "@/components/Table";
// import { supabaseAdmin } from "@/lib/supabaseAdmin";

// const columns = [
// 	{ header: "Structure Name", accessor: "name" },
// 	{ header: "Academic Year", accessor: "academicYear" },
// 	{ header: "Total Amount (GHS)", accessor: "amount" },
// 	{ header: "Actions", accessor: "action" },
// ];

// const FeeStructurePage = async () => {
// 	// Fetch Fees using Admin client to bypass RLS
// 	const { data: fees } = await supabaseAdmin.from("fee_structures").select(`
//       id,
//       name,
//       academic_years(name),
//       fee_items(amount)
//     `);

// 	const renderRow = (item: any) => (
// 		<tr
// 			key={item.id}
// 			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight'>
// 			<td className='p-4 font-semibold'>{item.name}</td>
// 			<td className='hidden md:table-cell'>
// 				{item.academic_years?.name || "N/A"}
// 			</td>
// 			<td className='font-bold text-green-600'>
// 				GHS{" "}
// 				{item.fee_items
// 					?.reduce((sum: number, i: any) => sum + i.amount, 0)
// 					.toFixed(2)}
// 			</td>
// 			<td>
// 				<div className='flex items-center gap-2'>
// 					{/* 'fee' table type needs to be added to FormModal */}
// 					<FormModal table='fee' type='delete' id={item.id} />
// 				</div>
// 			</td>
// 		</tr>
// 	);

// 	return (
// 		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
// 			<div className='flex items-center justify-between mb-4'>
// 				<h1 className='text-xl font-bold dark:text-dark-text'>
// 					Fee Structures
// 				</h1>
// 				<FormModal table='fee' type='create' />
// 			</div>
// 			<Table columns={columns} renderRow={renderRow} data={fees || []} />
// 		</div>
// 	);
// };

// export default FeeStructurePage;
