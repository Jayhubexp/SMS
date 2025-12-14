import Announcements from "@/components/Announcements";
import EventCalendar from "@/components/EventCalendar";
import UserCard from "@/components/UserCard";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";

const SecretaryPage = () => {
	return (
		<div className='p-4 flex gap-4 flex-col md:flex-row'>
			{/* LEFT */}
			<div className='w-full lg:w-2/3 flex flex-col gap-8'>
				<div className='flex flex-col gap-2'>
					<h1 className='text-2xl font-semibold dark:text-dark-text'>
						Secretary Dashboard
					</h1>
					<p className='text-sm text-gray-500 dark:text-dark-textSecondary'>
						Manage students, fees, and daily operations.
					</p>
				</div>

				{/* USER CARDS */}
				<div className='flex gap-4 justify-between flex-wrap'>
					<UserCard type='student' />
					<UserCard type='teacher' />
				</div>

				{/* QUICK ACTIONS */}
				<div className='bg-white p-4 rounded-md dark:bg-dark-bgSecondary'>
					<h2 className='text-xl font-semibold mb-4 dark:text-dark-text'>
						Quick Actions
					</h2>
					<div className='flex gap-4 flex-wrap'>
						{/* Manage Students Link */}
						<Link href='/list/students' className='w-full md:w-auto'>
							<button className='w-full md:w-auto flex items-center gap-2 p-3 rounded-md bg-lamaSkyLight dark:bg-blue-800 dark:text-dark-text hover:bg-lamaSky transition-colors'>
								<Image
									src='/student.png'
									alt='Manage Students'
									width={20}
									height={20}
								/>
								Manage Students
							</button>
						</Link>

						{/* Manage Teachers Link */}
						<Link href='/list/teachers' className='w-full md:w-auto'>
							<button className='w-full md:w-auto flex items-center gap-2 p-3 rounded-md bg-lamaSkyLight dark:bg-blue-800 dark:text-dark-text hover:bg-lamaSky transition-colors'>
								<Image
									src='/teacher.png'
									alt='Manage Teachers'
									width={20}
									height={20}
								/>
								Manage Teachers
							</button>
						</Link>

						{/* GENERATE FEE RECEIPT (Modal Trigger) */}
						{/* We wrap the FormModal inside a relative div so we can style the button appearance manually while letting FormModal handle the click logic if needed, 
                OR simpler: We can use FormModal's built-in button rendering if we pass a custom trigger. 
                For now, we will overlay the FormModal invisibly over our custom button for a consistent UI. */}
						<div className='relative w-full md:w-auto'>
							<div className='flex items-center gap-2 p-3 rounded-md bg-lamaPurpleLight dark:bg-purple-800 dark:text-dark-text hover:bg-lamaPurple transition-colors cursor-pointer'>
								<Link href='/finance/receipts' className='w-full md:w-auto'>
									<Image
										src='/finance.png'
										alt='Generate Receipt'
										width={20}
										height={20}
									/>
									<span>Generate Fee Receipt</span>
									{/* The Modal Trigger covering the area */}
									<div className='absolute inset-0 opacity-0'>
										<FormModal table='receipt' type='create' />
									</div>
								</Link>
							</div>
						</div>

						{/* PRINT ATTENDANCE (Placeholder for now, or link to attendance list) */}
						<Link href='/list/attendance' className='w-full md:w-auto'>
							<button className='w-full md:w-auto flex items-center gap-2 p-3 rounded-md bg-lamaYellowLight dark:bg-yellow-800 dark:text-dark-text hover:bg-lamaYellow transition-colors'>
								<Image
									src='/attendance.png'
									alt='Print Attendance'
									width={20}
									height={20}
								/>
								Attendance Register
							</button>
						</Link>
					</div>
				</div>
			</div>

			{/* RIGHT */}
			<div className='w-full lg:w-1/3 flex flex-col gap-8'>
				<EventCalendar />
				<Announcements />
			</div>
		</div>
	);
};

export default SecretaryPage;
