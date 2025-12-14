"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

const SettingsPage = () => {
	const { theme, toggleTheme } = useTheme();
	const { role } = useAuth();

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			<h1 className='text-2xl font-semibold mb-6 dark:text-dark-text'>
				Settings
			</h1>

			{/* Theme Settings */}
			<div className='mb-8'>
				<h2 className='text-lg font-medium mb-2 dark:text-dark-text'>Theme</h2>
				<div className='flex items-center gap-4'>
					<p className='text-sm text-gray-600 dark:text-dark-textSecondary'>
						Current theme: {theme}
					</p>
					<button
						onClick={toggleTheme}
						className='flex items-center gap-2 bg-lamaSky dark:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium'>
						{/* You will need to add sun.png and moon.png to your /public folder */}
						{theme === "light" ? (
							<Image src='/moon.png' alt='Dark Mode' width={20} height={20} />
						) : (
							<Image src='/sun.png' alt='Light Mode' width={20} height={20} />
						)}
						Toggle Theme
					</button>
				</div>
			</div>

			{/* User Role Information */}
			<div>
				<h2 className='text-lg font-medium mb-2 dark:text-dark-text'>
					User Role
				</h2>
				<p className='text-sm text-gray-600 dark:text-dark-textSecondary mb-2'>
					Your current role:{" "}
					<span className='font-semibold capitalize'>
						{role?.replace("_", " ") || "User"}
					</span>
				</p>
			</div>
		</div>
	);
};

export default SettingsPage;
