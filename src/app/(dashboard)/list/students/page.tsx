import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const columns = [
  { header: "First Name", accessor: "first_name", className: "hidden md:table-cell" },
  { header: "Last Name", accessor: "last_name", className: "hidden md:table-cell" },
  { header: "Admission No", accessor: "admission_number", className: "hidden md:table-cell" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" }, // Changed from Grade to Class
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // 1. Start building the query
  // We fetch 'classes(name)' instead of grade_levels
  let query = supabaseAdmin
    .from("students")
    .select("*, users!inner(first_name, last_name, email, phone_number), classes(name, id)")
    .order("id", { ascending: false });

  // 2. Apply Search Filter
  if (queryParams.search) {
    const searchValue = queryParams.search;
    // The '!inner' in the select above is CRITICAL for this filter to work without 400 errors
    query = query.or(
      `first_name.ilike.%${searchValue}%,last_name.ilike.%${searchValue}%`,
      { foreignTable: "users" }
    );
  }

  const { data: students, error } = await query;

  if (error) console.error("Error fetching students:", error);

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="hidden md:table-cell p-4">
        {item.users?.first_name || "N/A"}
      </td>
      <td className="hidden md:table-cell">
        {item.users?.last_name || "N/A"}
      </td>
      <td className="hidden md:table-cell">{item.admission_number}</td>
      
      {/* 3. Display Class Name */}
      <td className="hidden md:table-cell">{item.classes?.name || "N/A"}</td>
      
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <FormModal table="student" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="student" type="create" />
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={students || []} />
      <Pagination />
    </div>
  );
};

export default StudentListPage;


// import FormModal from "@/components/FormModal";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import Image from "next/image";
// import Link from "next/link";
// import { supabase } from "@/lib/supabase";

// const columns = [
// 	{ header: "Info", accessor: "info" },
// 	{
// 		header: "Admission No",
// 		accessor: "studentId",
// 		className: "hidden md:table-cell",
// 	},
// 	{ header: "Address", accessor: "address", className: "hidden lg:table-cell" },
// 	{ header: "Actions", accessor: "action" },
// ];

// const StudentListPage = async () => {
// 	// Fetch students joined with 'users' to get names
// 	const { data: students, error } = await supabase
// 		.from("students")
// 		.select("*, users(first_name, last_name, email, phone_number)")
// 		.order("id", { ascending: false });

// 	if (error) console.error("Error fetching students:", error);

// 	const renderRow = (item: any) => (
// 		<tr
// 			key={item.id}
// 			className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight'>
// 			<td className='flex items-center gap-4 p-4'>
// 				<div className='flex flex-col'>
// 					<h3 className='font-semibold'>
// 						{item.users?.first_name} {item.users?.last_name}
// 					</h3>
// 					<p className='text-xs text-gray-500'>{item.users?.email}</p>
// 				</div>
// 			</td>
// 			<td className='hidden md:table-cell'>{item.admission_number}</td>
// 			<td className='hidden md:table-cell'>{item.address}</td>
// 			<td>
// 				<div className='flex items-center gap-2'>
// 					<Link href={`/list/students/${item.id}`}>
// 						<button className='w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky'>
// 							<Image src='/view.png' alt='' width={16} height={16} />
// 						</button>
// 					</Link>
// 					<FormModal table='student' type='delete' id={item.id} />
// 				</div>
// 			</td>
// 		</tr>
// 	);

// 	return (
// 		<div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
// 			<div className='flex items-center justify-between'>
// 				<h1 className='hidden md:block text-lg font-semibold'>All Students</h1>
// 				<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
// 					<TableSearch />
// 					<div className='flex items-center gap-4 self-end'>
// 						<FormModal table='student' type='create' />
// 					</div>
// 				</div>
// 			</div>
// 			<Table columns={columns} renderRow={renderRow} data={students || []} />
// 			<Pagination />
// 		</div>
// 	);
// };

// export default StudentListPage;
