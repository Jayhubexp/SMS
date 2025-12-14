"use client";

import { useState } from "react";
import Image from "next/image";

type Announcement = {
	id: number;
	title: string;
	description: string;
	date: string;
	class_id?: number | null;
};

const AnnouncementsList = ({
	announcements,
}: {
	announcements: Announcement[];
}) => {
	const [selectedAnnouncement, setSelectedAnnouncement] =
		useState<Announcement | null>(null);

	// Close modal handler
	const closeModal = () => setSelectedAnnouncement(null);

	return (
		<>
			<div className='flex flex-col gap-4 mt-4'>
				{announcements && announcements.length > 0 ? (
					announcements.map((announcement, index) => {
						const bgColors = [
							"bg-lamaSkyLight dark:bg-blue-900",
							"bg-lamaPurpleLight dark:bg-purple-900",
							"bg-lamaYellowLight dark:bg-yellow-900",
						];
						const colorClass = bgColors[index % bgColors.length];

						return (
							<div
								key={announcement.id}
								onClick={() => setSelectedAnnouncement(announcement)}
								className={`${colorClass} rounded-md p-4 cursor-pointer transition-transform hover:scale-[1.02]`}>
								<div className='flex items-center justify-between'>
									<h2 className='font-medium dark:text-dark-text group-hover:text-blue-600 transition-colors'>
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
						);
					})
				) : (
					<p className='text-sm text-gray-500'>No announcements available.</p>
				)}
			</div>

			{/* MODAL */}
			{selectedAnnouncement && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4'>
					<div className='bg-white dark:bg-dark-bgSecondary p-6 rounded-lg w-full max-w-md relative shadow-xl'>
						{/* Close Button */}
						<div
							className='absolute top-4 right-4 cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full'
							onClick={closeModal}>
							<Image src='/close.png' alt='Close' width={14} height={14} />
						</div>

						{/* Modal Content */}
						<h2 className='text-xl font-bold mb-2 dark:text-dark-text pr-8'>
							{selectedAnnouncement.title}
						</h2>
						<span className='text-xs text-gray-500 dark:text-dark-textSecondary block mb-4'>
							{new Date(selectedAnnouncement.date).toLocaleDateString()}
						</span>
						<div className='max-h-[60vh] overflow-y-auto'>
							<p className='text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed'>
								{selectedAnnouncement.description}
							</p>
						</div>

						<div className='mt-6 flex justify-end'>
							<button
								onClick={closeModal}
								className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors'>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AnnouncementsList;
