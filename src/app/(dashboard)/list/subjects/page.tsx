import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Fetching from DB now
import Image from "next/image";

const columns = [
	{
		header: "Subject Name",
		accessor: "name",
	},
	{
		header: "Class",
		accessor: "class",
		className: "hidden md:table-cell",
	},
	{
		header: "Teacher",
		accessor: "teacher",
		className: "hidden md:table-cell",
	},
	{
		header: "Actions",
		accessor: "action",
	},
];

const SubjectListPage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const { page = "1" } = searchParams;
	const itemsPerPage = 10;
	const offset = (parseInt(page) - 1) * itemsPerPage;

    // Fetch Subjects from Supabase
    // We join 'classes' and 'teachers' (aliased as users table via teacher_id)
	const { data: subjects, count, error } = await supabaseAdmin
		.from("subjects")
		.select(`
            id, 
            name, 
            class_id, 
            teacher_id,
            classes(name),
            teachers(first_name, last_name)
        `, { count: "exact" })
		.range(offset, offset + itemsPerPage - 1)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching subjects:", error);
    }

	const renderRow = (item: any) => (
		<tr
			key={item.id}
			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
			<td className='flex items-center gap-4 p-4 font-semibold'>{item.name}</td>
			<td className='hidden md:table-cell'>{item.classes?.name || "All Classes"}</td>
			<td className='hidden md:table-cell'>
                {item.teachers ? (
                    `${item.teachers.first_name} ${item.teachers.last_name}`
                ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                )}
            </td>
			<td>
				<div className='flex items-center gap-2'>
                    <FormModal table='subject' type='update' data={item} />
                    <FormModal table='subject' type='delete' id={item.id} />
				</div>
			</td>
		</tr>
	);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			{/* TOP HEADER */}
			<div className='flex items-center justify-between'>
				<h1 className='hidden md:block text-lg font-semibold dark:text-dark-text'>
					All Subjects
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
						<FormModal table='subject' type='create' />
					</div>
				</div>
			</div>
			{/* DATA LIST */}
			<Table columns={columns} renderRow={renderRow} data={subjects || []} />
			{/* PAGINATION */}
			<Pagination count={count || 0} />
		</div>
	);
};

export default SubjectListPage;



// import FormModal from "@/components/FormModal";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import { supabaseAdmin } from "@/lib/supabaseAdmin";
// import Image from "next/image";

// const columns = [
// 	{ header: "Subject Name", accessor: "name" },
// 	{ header: "Class", accessor: "class", className: "hidden md:table-cell" },
// 	{ header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
// 	{ header: "Actions", accessor: "action" },
// ];

// const SubjectListPage = async ({
// 	searchParams,
// }: {
// 	searchParams: { [key: string]: string | undefined };
// }) => {
// 	const { page = "1" } = searchParams;
// 	const itemsPerPage = 10;
// 	const offset = (parseInt(page) - 1) * itemsPerPage;

//     // Fetch Subjects with related Class and Teacher
// 	const { data: subjects, count } = await supabaseAdmin
// 		.from("subjects")
// 		.select(`
//             id, name, class_id, teacher_id,
//             classes(name),
//             teachers:users!teacher_id(first_name, last_name)
//         `, { count: "exact" })
// 		.range(offset, offset + itemsPerPage - 1);

// 	const renderRow = (item: any) => (
// 		<tr
// 			key={item.id}
// 			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight dark:border-dark-border dark:even:bg-dark-bgSecondary dark:hover:bg-dark-border'>
// 			<td className='flex items-center gap-4 p-4'>{item.name}</td>
// 			<td className='hidden md:table-cell'>{item.classes?.name || "N/A"}</td>
// 			<td className='hidden md:table-cell'>
//                 {item.teachers ? `${item.teachers.first_name} ${item.teachers.last_name}` : "Unassigned"}
//             </td>
// 			<td>
// 				<div className='flex items-center gap-2'>
//                     <FormModal table='subject' type='update' data={item} />
//                     <FormModal table='subject' type='delete' id={item.id} />
// 				</div>
// 			</td>
// 		</tr>
// 	);

// 	return (
// 		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
// 			<div className='flex items-center justify-between'>
// 				<h1 className='hidden md:block text-lg font-semibold dark:text-dark-text'>All Subjects</h1>
// 				<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
// 					<TableSearch />
// 					<div className='flex items-center gap-4 self-end'>
// 						<FormModal table='subject' type='create' />
// 					</div>
// 				</div>
// 			</div>
// 			<Table columns={columns} renderRow={renderRow} data={subjects || []} />
// 			<Pagination count={count || 0} />
// 		</div>
// 	);
// };

// export default SubjectListPage;

