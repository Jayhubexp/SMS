import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Image from "next/image";
import Link from "next/link"; // Import Link

const columns = [
	{ header: "Receipt #", accessor: "receiptNumber" },
	{ header: "Student", accessor: "student" },
	{ header: "Amount", accessor: "amount", className: "hidden sm:table-cell" },
	{ header: "Date", accessor: "date", className: "hidden md:table-cell" },
	{ header: "Issuer", accessor: "issuer", className: "hidden lg:table-cell" },
	{ header: "Actions", accessor: "action" },
];

const ReceiptsPage = async () => {
	const { data: receipts } = await supabaseAdmin
		.from("receipts")
		.select(
			`
      id,
      receipt_number,
      issued_at,
      payments (
        id,
        amount,
        students (
            admission_number,
            users (first_name, last_name)
        )
      ),
      users (first_name, last_name) 
    `,
		)
		.order("issued_at", { ascending: false });

	const renderRow = (item: any) => {
		const amount = item.payments?.amount || 0;

		return (
			<tr
				key={item.id}
				className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
				<td className='p-4 font-mono text-xs md:text-sm'>
					<span className='block md:hidden font-bold mb-1'>
						#{item.receipt_number.slice(-6)}
					</span>
					<span className='hidden md:block'>{item.receipt_number}</span>
					<span className='block md:hidden text-gray-400 text-[10px]'>
						{new Date(item.issued_at).toLocaleDateString()}
					</span>
				</td>

				<td className='font-medium'>
					<div className='flex flex-col'>
						<span>
							{item.payments?.students?.users?.first_name}{" "}
							{item.payments?.students?.users?.last_name}
						</span>
						<span className='text-xs text-gray-400'>
							{item.payments?.students?.admission_number || "N/A"}
						</span>
						<span className='block sm:hidden font-bold text-green-600 mt-1'>
							GHS {amount.toFixed(2)}
						</span>
					</div>
				</td>

				<td className='hidden sm:table-cell font-bold text-green-600'>
					GHS {amount.toFixed(2)}
				</td>

				<td className='hidden md:table-cell'>
					{new Date(item.issued_at).toLocaleDateString()}
				</td>

				<td className='hidden lg:table-cell'>
					{item.users?.first_name} {item.users?.last_name}
				</td>

				<td>
					<div className='flex items-center gap-2'>
						{/* View / Print Button */}
						<Link
							href={`/finance/receipts/print/${item.id}`} // Using Receipt ID
							className='w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:bg-lamaSkyLight transition'>
							<Image src='/view.png' alt='view' width={16} height={16} />
						</Link>

						{/* Delete Button */}
						<FormModal table='receipt' type='delete' id={item.id} />
					</div>
				</td>
			</tr>
		);
	};

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			<div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4'>
				<h1 className='text-xl font-bold dark:text-dark-text'>Fee Receipts</h1>
				<div className='w-full md:w-auto'>
					<FormModal table='receipt' type='create' />
				</div>
			</div>

			<div className='overflow-x-auto'>
				<Table columns={columns} renderRow={renderRow} data={receipts || []} />
			</div>
		</div>
	);
};

export default ReceiptsPage;



// import FormModal from "@/components/FormModal";
// import Table from "@/components/Table";
// import { supabaseAdmin } from "@/lib/supabaseAdmin";
// import Image from "next/image";

// const columns = [
// 	{ header: "Receipt #", accessor: "receiptNumber" },
// 	{ header: "Student", accessor: "student" },
// 	{ header: "Amount", accessor: "amount", className: "hidden sm:table-cell" },
// 	{ header: "Date", accessor: "date", className: "hidden md:table-cell" },
// 	{ header: "Issuer", accessor: "issuer", className: "hidden lg:table-cell" },
// 	{ header: "Actions", accessor: "action" },
// ];

// const ReceiptsPage = async () => {
// 	const { data: receipts } = await supabaseAdmin
// 		.from("receipts")
// 		.select(
// 			`
//       id,
//       receipt_number,
//       issued_at,
//       payments (
//         id,
//         amount,
//         students (
//             admission_number,
//             users (first_name, last_name)
//         )
//       ),
//       users (first_name, last_name) 
//     `,
// 		)
// 		.order("issued_at", { ascending: false });

// 	const renderRow = (item: any) => {
//         // FIX: Safely extract amount with a fallback to 0
//         // This prevents crash if payment is null (orphan receipt)
//         const amount = item.payments?.amount || 0;
        
//         return (
// 		<tr
// 			key={item.id}
// 			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
// 			<td className='p-4 font-mono text-xs md:text-sm'>
// 				<span className='block md:hidden font-bold mb-1'>
// 					#{item.receipt_number.slice(-6)}
// 				</span>
// 				<span className='hidden md:block'>{item.receipt_number}</span>
// 				<span className='block md:hidden text-gray-400 text-[10px]'>
// 					{new Date(item.issued_at).toLocaleDateString()}
// 				</span>
// 			</td>

// 			<td className='font-medium'>
// 				<div className='flex flex-col'>
// 					<span>
// 						{item.payments?.students?.users?.first_name}{" "}
// 						{item.payments?.students?.users?.last_name}
// 					</span>
// 					<span className='text-xs text-gray-400'>
// 						{item.payments?.students?.admission_number || "N/A"}
// 					</span>
// 					<span className='block sm:hidden font-bold text-green-600 mt-1'>
// 						GHS {amount.toFixed(2)}
// 					</span>
// 				</div>
// 			</td>

// 			<td className='hidden sm:table-cell font-bold text-green-600'>
// 				GHS {amount.toFixed(2)}
// 			</td>

// 			<td className='hidden md:table-cell'>
// 				{new Date(item.issued_at).toLocaleDateString()}
// 			</td>

// 			<td className='hidden lg:table-cell'>
// 				{item.users?.first_name} {item.users?.last_name}
// 			</td>

// 			<td>
// 				<div className='flex items-center gap-2'>
//                     {/* Add Delete Button */}
// 					<FormModal table='receipt' type='delete' id={item.id} />
// 				</div>
// 			</td>
// 		</tr>
// 	)};

// 	return (
// 		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
// 			<div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4'>
// 				<h1 className='text-xl font-bold dark:text-dark-text'>Fee Receipts</h1>
// 				<div className='w-full md:w-auto'>
// 					<FormModal table='receipt' type='create' />
// 				</div>
// 			</div>

// 			<div className='overflow-x-auto'>
// 				<Table columns={columns} renderRow={renderRow} data={receipts || []} />
// 			</div>
// 		</div>
// 	);
// };

// export default ReceiptsPage;


// // import FormModal from "@/components/FormModal";
// // import Table from "@/components/Table";
// // import { supabaseAdmin } from "@/lib/supabaseAdmin";
// // import Image from "next/image";
// // import Link from "next/link"; // Ensure Link is imported

// // const columns = [
// // 	{ header: "Receipt #", accessor: "receiptNumber" },
// // 	{ header: "Student", accessor: "student" },
// // 	{ header: "Amount", accessor: "amount", className: "hidden sm:table-cell" },
// // 	{ header: "Date", accessor: "date", className: "hidden md:table-cell" },
// // 	{ header: "Issuer", accessor: "issuer", className: "hidden lg:table-cell" },
// // 	{ header: "Actions", accessor: "action" },
// // ];

// // const ReceiptsPage = async () => {
// //     // Note: I added 'id' to the main select list so we can delete the receipt record
// // 	const { data: receipts } = await supabaseAdmin
// // 		.from("receipts")
// // 		.select(
// // 			`
// //       id,
// //       receipt_number,
// //       issued_at,
// //       payments (
// //         id,
// //         amount,
// //         students (
// //             admission_number,
// //             users (first_name, last_name)
// //         )
// //       ),
// //       users (first_name, last_name) 
// //     `,
// // 		)
// // 		.order("issued_at", { ascending: false });

// // 	const renderRow = (item: any) => (
// // 		<tr
// // 			key={item.id}
// // 			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
// // 			<td className='p-4 font-mono text-xs md:text-sm'>
// // 				<span className='block md:hidden font-bold mb-1'>
// // 					#{item.receipt_number.slice(-6)}
// // 				</span>
// // 				<span className='hidden md:block'>{item.receipt_number}</span>
// // 				<span className='block md:hidden text-gray-400 text-[10px]'>
// // 					{new Date(item.issued_at).toLocaleDateString()}
// // 				</span>
// // 			</td>

// // 			<td className='font-medium'>
// // 				<div className='flex flex-col'>
// // 					<span>
// // 						{item.payments?.students?.users?.first_name}{" "}
// // 						{item.payments?.students?.users?.last_name}
// // 					</span>
// // 					<span className='text-xs text-gray-400'>
// // 						{item.payments?.students?.admission_number}
// // 					</span>
// // 					<span className='block sm:hidden font-bold text-green-600 mt-1'>
// // 						GHS {item.payments?.amount.toFixed(2)}
// // 					</span>
// // 				</div>
// // 			</td>

// // 			<td className='hidden sm:table-cell font-bold text-green-600'>
// // 				GHS {item.payments?.amount.toFixed(2)}
// // 			</td>

// // 			<td className='hidden md:table-cell'>
// // 				{new Date(item.issued_at).toLocaleDateString()}
// // 			</td>

// // 			<td className='hidden lg:table-cell'>
// // 				{item.users?.first_name} {item.users?.last_name}
// // 			</td>

// // 			<td>
// //                 <div className="flex items-center gap-2">
// //                     {/* Print Button */}
// //                     {item.payments?.id && (
// //                         <Link href={`/finance/receipts/print/${item.payments.id}`}>
// //                             <button className='w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:bg-lamaSkyLight transition'>
// //                                 <Image src="/view.png" alt="Print" width={16} height={16} />
// //                             </button>
// //                         </Link>
// //                     )}
                    
// //                     {/* Delete Button - Using the item.id (Receipt ID) */}
// //                     <FormModal table="receipt" type="delete" id={item.id} />
// //                 </div>
// // 			</td>
// // 		</tr>
// // 	);

// // 	return (
// // 		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
// // 			<div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4'>
// // 				<h1 className='text-xl font-bold dark:text-dark-text'>Fee Receipts</h1>
// // 				<div className='w-full md:w-auto'>
// // 					<FormModal table='receipt' type='create' />
// // 				</div>
// // 			</div>

// // 			<div className='overflow-x-auto'>
// // 				<Table columns={columns} renderRow={renderRow} data={receipts || []} />
// // 			</div>
// // 		</div>
// // 	);
// // };

// // export default ReceiptsPage;

