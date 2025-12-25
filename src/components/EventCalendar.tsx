import Image from "next/image";
import EventCalendarContainer from "./EventCalendarContainer"; // Import the client wrapper
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import FormModal from "./FormModal"; // 1. Import FormModal

const EventCalendar = async () => {
	// FETCH REAL EVENTS
	const { data: events, error } = await supabaseAdmin
		.from("events")
		.select("*")
		.order("start_time", { ascending: true }) // Upcoming events first
		.limit(3); // Only show top 3

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md'>
			<EventCalendarContainer />

			<div className='flex items-center justify-between'>
				<h1 className='text-xl font-semibold my-4 dark:text-dark-text'>
					Events
				</h1>
				<Image src='/moreDark.png' alt='' width={20} height={20} />
			</div>

			<div className='flex flex-col gap-4'>
				{events && events.length > 0 ? (
					events.map((event: any) => (
						<div
							className='p-5 rounded-md border-2 border-gray-100 dark:border-dark-border border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple'
							key={event.id}>
							<div className='flex items-center justify-between'>
								<h1 className='font-semibold text-gray-600 dark:text-dark-text'>
									{event.title}
								</h1>
								<div className='flex items-center gap-2'>
									<span className='text-gray-300 dark:text-dark-textSecondary text-xs'>
										{new Date(event.start_time).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
									{/* View button (opens same modal as list view) */}
									<FormModal table='event' type='view' data={event} />
								</div>
							</div>
							<p className='mt-2 text-gray-400 dark:text-dark-textSecondary text-sm'>
								{event.description}
							</p>
						</div>
					))
				) : (
					<p className='text-sm text-gray-500 italic'>No upcoming events.</p>
				)}
			</div>
		</div>
	);
};

export default EventCalendar;
