"use client";

import { useAuth } from "@/context/AuthContext";
import AvatarLetter from "@/components/AvatarLetter";

const ProfilePage = () => {
	const { user, firstName, role } = useAuth();

	return (
		<div className='bg-white dark:bg-dark-bgSecondary p-4 rounded-md flex-1 m-4 mt-0'>
			<h1 className='text-2xl font-semibold mb-6 dark:text-dark-text'>
				My Profile
			</h1>
			<div className='flex flex-col md:flex-row gap-8 items-center'>
				<AvatarLetter
					firstName={firstName || user?.email?.split("@")[0] || "U"}
					size='lg'
				/>
				<div className='flex flex-col gap-2'>
					<h2 className='text-xl font-medium dark:text-dark-text'>
						{firstName || user?.email?.split("@")[0] || "User"}
					</h2>
					<p className='text-gray-500 dark:text-dark-textSecondary'>
						Email: {user?.email}
					</p>
					<p className='text-gray-500 dark:text-dark-textSecondary capitalize'>
						Role: {role?.replace("_", " ") || "User"}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
