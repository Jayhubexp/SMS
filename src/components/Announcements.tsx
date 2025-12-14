import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import AnnouncementCard from "./AnnouncementCard";

const Announcements = async () => {
	// Fetch latest 3 announcements
	const { data: announcements } = await supabaseAdmin
		.from("announcements")
		.select("*")
		.order("date", { ascending: false })
		.limit(4);

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md'>
			<div className='flex items-center justify-between'>
				<h1 className='text-xl font-semibold dark:text-dark-text'>
					Announcements
				</h1>
				<Link
					href=''
					className='text-xs text-gray-400 dark:text-dark-textSecondary hover:underline'>
					View All
				</Link>
			</div>
			<div className='flex flex-col gap-4 mt-4'>
				{announcements && announcements.length > 0 ? (
					announcements.map((announcement: any, index: number) => {
						// Alternating colors based on index
						const bgColors = [
							"bg-lamaSkyLight dark:bg-blue-900",
							"bg-lamaPurpleLight dark:bg-purple-900",
							"bg-lamaYellowLight dark:bg-yellow-900",
						];
						const colorClass = bgColors[index % bgColors.length];

						return (
							<AnnouncementCard
								key={announcement.id}
								announcement={announcement}
								colorClass={colorClass}
							/>
						);
					})
				) : (
					<p className='text-sm text-gray-500'>No announcements available.</p>
				)}
			</div>
		</div>
	);
};

export default Announcements;

// import { supabaseAdmin } from "@/lib/supabaseAdmin";
// import Link from "next/link";

// const Announcements = async () => {
// 	const { data: announcements } = await supabaseAdmin
// 		.from("announcements")
// 		.select("*")
// 		.order("date", { ascending: false })
// 		.limit(3);

// 	return (
// 		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md h-full'>
// 			<div className='flex items-center justify-between'>
// 				<h1 className='text-xl font-semibold dark:text-dark-text'>
// 					Announcements
// 				</h1>
// 				<Link
// 					href='/list/announcements'
// 					className='text-xs text-gray-400 dark:text-dark-textSecondary hover:underline'>
// 					View All
// 				</Link>
// 			</div>
// 			<div className='flex flex-col gap-4 mt-4'>
// 				{announcements && announcements.length > 0 ? (
// 					announcements.map((announcement: any, index: number) => {
// 						const bgColors = [
// 							"bg-lamaSkyLight dark:bg-blue-900",
// 							"bg-lamaPurpleLight dark:bg-purple-900",
// 							"bg-lamaYellowLight dark:bg-yellow-900",
// 						];
// 						const colorClass = bgColors[index % bgColors.length];

// 						return (
// 							<Link
// 								href='/list/announcements'
// 								key={announcement.id}
// 								className='block group'>
// 								<div
// 									className={`${colorClass} rounded-md p-4 transition-transform hover:scale-[1.02] cursor-pointer`}>
// 									<div className='flex items-center justify-between'>
// 										<h2 className='font-medium dark:text-dark-text group-hover:text-blue-600 transition-colors'>
// 											{announcement.title}
// 										</h2>
// 										<span className='text-xs text-gray-400 bg-white dark:bg-dark-bg dark:text-dark-textSecondary rounded-md px-1 py-1'>
// 											{new Date(announcement.date).toLocaleDateString()}
// 										</span>
// 									</div>
// 									<p className='text-sm text-gray-400 dark:text-dark-textSecondary mt-1 line-clamp-2'>
// 										{announcement.description}
// 									</p>
// 								</div>
// 							</Link>
// 						);
// 					})
// 				) : (
// 					<p className='text-sm text-gray-500'>No announcements available.</p>
// 				)}
// 			</div>
// 		</div>
// 	);
// };

// export default Announcements;
