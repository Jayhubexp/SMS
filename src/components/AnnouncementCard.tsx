"use client";

import { useState } from "react";
import Image from "next/image";

type Announcement = {
	id: number;
	title: string;
	description: string;
	date: string;
};

const AnnouncementCard = ({
	announcement,
	colorClass,
}: {
	announcement: Announcement;
	colorClass: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div
				className={`${colorClass} rounded-md p-4 cursor-pointer hover:shadow-md transition-shadow`}
				onClick={() => setIsOpen(true)}>
				<div className='flex items-center justify-between'>
					<h2 className='font-medium dark:text-dark-text'>
						{announcement.title}
					</h2>
					<span className='text-xs text-gray-400 bg-white dark:bg-dark-bg dark:text-dark-textSecondary rounded-md px-1 py-1'>
						{new Date(announcement.date).toLocaleDateString()}
					</span>
				</div>
				<p className='text-sm text-gray-400 dark:text-dark-textSecondary mt-1 line-clamp-2'>
					{announcement.description}
				</p>
			</div>

			{isOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
					<div className='bg-white dark:bg-dark-bgSecondary p-6 rounded-lg w-full max-w-md relative shadow-xl max-h-[80vh] overflow-y-auto'>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setIsOpen(false);
							}}
							className='absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full'>
							<Image src='/close.png' alt='Close' width={14} height={14} />
						</button>

						<div className='flex flex-col gap-4 mt-2'>
							<div className='flex justify-between items-start gap-4'>
								<h2 className='text-xl font-bold dark:text-dark-text break-words'>
									{announcement.title}
								</h2>
								<span className='text-xs text-gray-500 whitespace-nowrap pt-1'>
									{new Date(announcement.date).toLocaleDateString()}
								</span>
							</div>

							<div className='w-full h-px bg-gray-200 dark:bg-gray-700' />

							<p className='text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed'>
								{announcement.description}
							</p>
						</div>
					</div>

					{/* Backdrop click to close */}
					<div
						className='absolute inset-0 -z-10'
						onClick={() => setIsOpen(false)}
					/>
				</div>
			)}
		</>
	);
};

export default AnnouncementCard;
