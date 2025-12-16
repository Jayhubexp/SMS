import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import AnnouncementCard from "./AnnouncementCard";
import { unstable_noStore as noStore } from "next/cache"; // 1. Import noStore

const Announcements = async () => {
    noStore(); // 2. Call this to opt out of caching for this component

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
					href='/list/announcements'
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
// import AnnouncementCard from "./AnnouncementCard";

// const Announcements = async () => {
// 	// Fetch latest 3 announcements
// 	const { data: announcements } = await supabaseAdmin
// 		.from("announcements")
// 		.select("*")
// 		.order("date", { ascending: false })
// 		.limit(4);

// 	return (
// 		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md'>
// 			<div className='flex items-center justify-between'>
// 				<h1 className='text-xl font-semibold dark:text-dark-text'>
// 					Announcements
// 				</h1>
// 				<Link
// 					href=''
// 					className='text-xs text-gray-400 dark:text-dark-textSecondary hover:underline'>
// 					View All
// 				</Link>
// 			</div>
// 			<div className='flex flex-col gap-4 mt-4'>
// 				{announcements && announcements.length > 0 ? (
// 					announcements.map((announcement: any, index: number) => {
// 						// Alternating colors based on index
// 						const bgColors = [
// 							"bg-lamaSkyLight dark:bg-blue-900",
// 							"bg-lamaPurpleLight dark:bg-purple-900",
// 							"bg-lamaYellowLight dark:bg-yellow-900",
// 						];
// 						const colorClass = bgColors[index % bgColors.length];

// 						return (
// 							<AnnouncementCard
// 								key={announcement.id}
// 								announcement={announcement}
// 								colorClass={colorClass}
// 							/>
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

