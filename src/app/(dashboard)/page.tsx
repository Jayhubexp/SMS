"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardRedirector = () => {
	const { role } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (role) {
			switch (role) {
				case "managing_director":
					router.push("/managing-director");
					break;
				case "secretary":
					router.push("/secretary");
					break;
				case "system_administrator":
					router.push("/system-administrator");
					break;
				case "teacher":
					router.push("/teacher");
					break;
				case "student":
					router.push("/student");
					break;
				case "parent":
					router.push("/parent");
					break;
				default:
					router.push("/sign-in"); // Or a default page
			}
		}
	}, [role, router]);

	return (
		<div className='flex-1 flex items-center justify-center p-4'>
			<h1 className='text-xl dark:text-dark-text'>Loading your dashboard...</h1>
		</div>
	);
};

export default DashboardRedirector;
