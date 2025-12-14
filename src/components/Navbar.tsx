"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import AvatarLetter from "./AvatarLetter";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AnnouncementCard from "./AnnouncementCard";

const Navbar = () => {
	const { user, firstName, role, logout } = useAuth(); // Get user, firstName, logout from context
	const { theme, toggleTheme } = useTheme(); // Get theme context
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const [showLatestModal, setShowLatestModal] = useState(false);
	const [latestAnnouncement, setLatestAnnouncement] = useState<any>(null);


	const handleLogout = async () => {
		setIsDropdownOpen(false);
		await logout();
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isDropdownOpen]);

	// Fetch unread announcements count
	useEffect(() => {
		const fetchAnnouncements = async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const { count } = await supabase
				.from("announcements")
				.select("*", { count: "exact", head: true })
				.gt("date", yesterday.toISOString());

			setUnreadCount(count || 0);
		};

		fetchAnnouncements();
	}, []);

	return (
		<div className='flex items-center justify-between p-4 dark:text-dark-text'>
			{/* SEARCH BAR */}
			<div className='hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 dark:ring-dark-border px-2'>
				<Image src='/search.png' alt='' width={14} height={14} />
				<input
					type='text'
					placeholder='Search...'
					className='w-[200px] p-2 bg-transparent outline-none'
				/>
			</div>
			{/* ICONS AND USER */}
			<div className='flex items-center gap-6 justify-end w-full'>
				{/* Theme Toggle */}
				<button
					onClick={toggleTheme}
					className='bg-white dark:bg-dark-bgSecondary rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
					{theme === "light" ? (
						<Image src='/moon.png' alt='Dark Mode' width={20} height={20} /> // Assume you have moon.png
					) : (
						<Image src='/sun.png' alt='Light Mode' width={20} height={20} /> // Assume you have sun.png
					)}
				</button>

				<div className='bg-white dark:bg-dark-bgSecondary rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
					<Image src='/message.png' alt='' width={20} height={20} />
				</div>

				{/* Announcement Icon */}
				<div 
            onClick={() => latestAnnouncement ? setShowLatestModal(true) : null}
            className='bg-white dark:bg-dark-bgSecondary rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'
        >
          <Image src='/announcement.png' alt='' width={20} height={20} />
          {unreadCount > 0 && (
            <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs'>
              {unreadCount}
            </div>
          )}
        </div>

				<div className='flex flex-col'>
					<span className='text-xs leading-3 font-medium'>
						{firstName || user?.email?.split("@")[0] || "User"}
					</span>
					<span className='text-[10px] text-gray-500 dark:text-dark-textSecondary text-right capitalize'>
						{role?.replace("_", " ") || "User"}
					</span>
				</div>
				{/* Avatar with Dropdown */}
				<div className='relative' ref={dropdownRef}>
					<button
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						title='User menu'
						className='focus:outline-none'>
						<AvatarLetter
							firstName={firstName || user?.email?.split("@")[0] || "U"}
							size='md'
						/>
					</button>
					{/* Dropdown Menu */}
					{isDropdownOpen && (
						<div className='absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50'>
							<div className='py-1'>
								<div className='px-4 py-2 text-sm font-medium text-gray-900 dark:text-dark-text border-b border-gray-200 dark:border-dark-border'>
									{firstName || user?.email?.split("@")[0] || "User"}
								</div>
								<button
									onClick={handleLogout}
									className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-textSecondary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors flex items-center gap-2'>
									<Image
										src='/logout.png'
										alt='Logout'
										width={16}
										height={16}
									/>
									Logout
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			{showLatestModal && latestAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-dark-bgSecondary p-6 rounded-lg w-full max-w-md relative shadow-xl">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLatestModal(false); }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </button>
            
            <h2 className="text-xl font-bold mb-2 dark:text-dark-text pr-8">
              {latestAnnouncement.title}
            </h2>
            <span className="text-xs text-gray-500 dark:text-dark-textSecondary block mb-4">
              {new Date(latestAnnouncement.date).toLocaleDateString()}
            </span>
            <div className="max-h-[60vh] overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {latestAnnouncement.description}
                </p>
            </div>
            
            <div className="mt-6 flex justify-between">
                <Link href="/list/announcements" className="text-blue-500 text-sm hover:underline self-center">
                    View All
                </Link>
                <button 
                    onClick={() => setShowLatestModal(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                    Close
                </button>
            </div>
          </div>
          {/* Backdrop */}
          <div className="absolute inset-0 -z-10" onClick={() => setShowLatestModal(false)} />
        </div>
      )}
		</div>
	);
};

export default Navbar;
