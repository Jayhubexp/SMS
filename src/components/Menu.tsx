"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
	{
		title: "MENU",
		items: [
			// ... (Keep Home, Teachers, Students, Parents, Subjects, Classes, Lessons)
			{
				icon: "/home.png",
				label: "Home",
				href: "/",
				visible: [
					"managing_director",
					"secretary",
					"system_administrator",
					"teacher",
					"parent",
					"student",
				],
			},
			{
				icon: "/teacher.png",
				label: "Teachers",
				href: "/list/teachers",
				visible: ["managing_director", "secretary", "system_administrator"],
			},
			{
				icon: "/student.png",
				label: "Students",
				href: "/list/students",
				visible: [
					"managing_director",
					"secretary",
					"system_administrator",
					"teacher",
				],
			},
			{
				icon: "/parent.png",
				label: "Parents",
				href: "/list/parents",
				visible: ["managing_director", "secretary", "system_administrator"],
			},
			{
				icon: "/subject.png",
				label: "Subjects",
				href: "/list/subjects",
				visible: ["managing_director", "system_administrator", "secretary",],
			},
			{
				icon: "/class.png",
				label: "Classes",
				href: "/list/classes",
				visible: [
					"managing_director",
					"secretary",
					"system_administrator",
					"teacher",
				],
			},
			{
				icon: "/lesson.png",
				label: "Lessons",
				href: "/list/lessons",
				visible: ["managing_director", "system_administrator", "teacher"],
			},
			{
				icon: "/exam.png",
				label: "Exams",
				href: "/list/exams",
				visible: ["system_administrator", "teacher", "student", "parent"],
			},
			{
				icon: "/assignment.png",
				label: "Assignments",
				href: "/list/assignments",
				visible: ["system_administrator", "teacher", "student", "parent"],
			},
			{
				icon: "/result.png",
				label: "Results",
				href: "/list/results",
				visible: ["system_administrator", "teacher", "student", "parent"],
			},
			{
				icon: "/attendance.png",
				label: "Attendance",
				href: "/list/attendance",
				visible: ["secretary", "teacher", "student"],
			},
			{
				icon: "/calendar.png",
				label: "Events",
				href: "/list/events",
				visible: [
					"managing_director",
					"secretary",
					"system_administrator"
					
				],
			},
			// REMOVED MESSAGES ICON HERE
			{
				icon: "/announcement.png",
				label: "Announcements",
				href: "/list/announcements",
				visible: [
					"managing_director",
					"secretary",
					"system_administrator"
					
				],
			},
			{
				icon: "/finance.png",
				label: "Fee Structures",
				href: "/finance/fees",
				visible: ["managing_director"],
			},
			{
				icon: "/finance.png",
				label: "Issue Receipts",
				href: "/finance/receipts",
				visible: ["secretary", "managing_director"],
			},
		],
	},
	{
		title: "OTHER",
		items: [
			{
				icon: "/profile.png",
				label: "Profile",
				href: "/profile",
				visible: [
					"managing_director",
					"secretary",
					"system_administrator",
					"teacher",
					"parent",
					"student",
				],
			},
			{
				icon: "/setting.png",
				label: "Settings",
				href: "/settings",
				visible: ["system_administrator", "managing_director"],
			},
			{
				icon: "/logout.png",
				label: "Logout",
				href: "/sign-in",
				visible: [
					"managing_director",
					"secretary",
					"system_administrator",
					"teacher",
					"parent",
					"student",
				],
			},
		],
	},
];

const getDashboardPath = (role: string) => {
	const dashboardMap: Record<string, string> = {
		managing_director: "/managing-director",
		secretary: "/secretary",
		system_administrator: "/system-administrator",
		teacher: "/teacher",
		student: "/student",
		parent: "/parent",
	};
	return dashboardMap[role] || "/student";
};

const Menu = ({ mobileTrigger = false }: { mobileTrigger?: boolean }) => {
	const { role } = useAuth();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	if (!role) return null;

	if (mobileTrigger) {
		return (
			<div className='md:hidden'>
				<button
					onClick={() => setIsOpen(!isOpen)}
					className='p-2 text-gray-600 dark:text-gray-300 focus:outline-none bg-gray-100 dark:bg-dark-border rounded-md'>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
						/>
					</svg>
				</button>

				{isOpen && (
					<div className='absolute top-16 left-0 w-full bg-white dark:bg-dark-bgSecondary shadow-lg z-50 p-4 border-t border-gray-100 dark:border-gray-700'>
						<MenuContent
							role={role}
							pathname={pathname}
							closeMenu={() => setIsOpen(false)}
						/>
					</div>
				)}
			</div>
		);
	}

	return <MenuContent role={role} pathname={pathname} />;
};

const MenuContent = ({
	role,
	pathname,
	closeMenu,
}: {
	role: string;
	pathname: string;
	closeMenu?: () => void;
}) => (
	<div className='mt-4 text-sm'>
		{menuItems.map((i) => (
			<div className='flex flex-col gap-2' key={i.title}>
				<span className='hidden lg:block text-gray-400 dark:text-dark-textSecondary font-light my-4 uppercase text-xs'>
					{i.title}
				</span>
				{i.items.map((item) => {
					if (item.visible.includes(role)) {
						const href =
							item.label === "Home" ? getDashboardPath(role) : item.href;
						const isActive = pathname === href;

						return (
							<Link
								href={href}
								key={item.label}
								onClick={closeMenu}
								className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md transition-colors ${
									isActive
										? "bg-lamaSkyLight dark:bg-dark-border text-blue-600 dark:text-white"
										: "text-gray-500 hover:bg-lamaSkyLight dark:hover:bg-dark-border"
								}`}>
								<Image src={item.icon} alt='' width={20} height={20} />
								<span className='lg:block md:hidden block'>{item.label}</span>
							</Link>
						);
					}
					return null;
				})}
			</div>
		))}
	</div>
);

export default Menu;

