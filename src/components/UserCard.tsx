import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Image from "next/image";

const UserCard = async ({
	type,
}: {
	type: "student" | "teacher" | "parent" | "staff";
}) => {
	// Map the 'type' prop to the correct database table
	const tableMap: Record<string, string> = {
		student: "students",
		teacher: "teachers",
		parent: "parents",
		staff: "users", // Assuming 'staff' might refer to all users or specific staff profiles
	};

	const tableName = tableMap[type] || "users";

	// Fetch the count
	// We use head: true to get only the count, not the data (faster)
	const { count } = await supabaseAdmin
		.from(tableName)
		.select("*", { count: "exact", head: true });

	return (
		<div className='rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]'>
			<div className='flex justify-between items-center'>
				<span className='text-[10px] bg-white px-2 py-1 rounded-full text-green-600'>
					2024/25
				</span>
				<Image src='/more.png' alt='' width={20} height={20} />
			</div>
			{/* Display the real count, default to 0 if null */}
			<h1 className='text-2xl font-semibold my-4'>{count || 0}</h1>
			<h2 className='capitalize text-sm font-medium text-gray-500'>{type}s</h2>
		</div>
	);
};

export default UserCard;

// import Image from "next/image";

// const UserCard = ({ type }: { type: string }) => {
//   return (
//     <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow dark:odd:bg-purple-900 dark:even:bg-yellow-900 p-4 flex-1 min-w-[130px]">
//       <div className="flex justify-between items-center">
//         <span className="text-[10px] bg-white dark:bg-dark-bg dark:text-green-400 px-2 py-1 rounded-full text-green-600">
//           2024/25
//         </span>
//         <Image src="/more.png" alt="" width={20} height={20} />
//       </div>
//       <h1 className="text-2xl font-semibold my-4 dark:text-dark-text">1,234</h1>
//       <h2 className="capitalize text-sm font-medium text-gray-500 dark:text-dark-textSecondary">{type}s</h2>
//     </div>
//   );
// };

// export default UserCard;
