import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='min-h-screen flex flex-col md:flex-row dark:bg-dark-bg'>
			{/* LEFT SIDEBAR */}
			{/* Mobile: w-full (stacked top), Desktop: w-[14%] (fixed left) */}
			<div className='w-full md:w-[14%] lg:w-[16%] xl:w-[14%] p-4 dark:bg-dark-bgSecondary dark:border-r dark:border-dark-border flex flex-col'>
				{/* Header / Logo Area */}
				{/* On mobile, we flex this to align Logo and the Menu Toggle (which is inside Menu component) */}
				<div className='flex items-center justify-between md:justify-center lg:justify-start gap-2 mb-0 md:mb-4'>
					<Link href='/' className='flex items-center justify-center gap-2'>
						<Image src='/logo.jpg' alt='logo' width={32} height={32} />
						<span className='font-bold dark:text-dark-text block md:hidden lg:block'>
							Mercy School
						</span>
					</Link>

					{/* Menu Component (Contains the mobile toggle button) */}
					<div className='block md:hidden'>
						{/* This div wraps the Menu on mobile so the toggle appears here in the flex header */}
						<Menu mobileTrigger={true} />
					</div>
				</div>

				{/* Desktop Menu (Hidden on mobile, handled by the wrapper above for layout) */}
				<div className='hidden md:block'>
					<Menu />
				</div>
			</div>

			{/* RIGHT CONTENT */}
			{/* Mobile: w-full, Desktop: Remaining width */}
			<div className='w-full md:w-[86%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] dark:bg-dark-bg flex flex-col flex-1 overflow-hidden'>
				<Navbar />
				<div className='flex-1 overflow-y-auto p-4 overflow-x-hidden'>
					{children}
				</div>
			</div>
		</div>
	);
}

// import Menu from "@/components/Menu";
// import Navbar from "@/components/Navbar";
// import Image from "next/image";
// import Link from "next/link";

// export default function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div className="min-h-screen flex dark:bg-dark-bg">
//       {/* LEFT */}
//       <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 dark:bg-dark-bgSecondary dark:border-r dark:border-dark-border">
//         <Link
//           href="/"
//           className="flex items-center justify-center lg:justify-start gap-2"
//         >
//           <Image src="/logo.jpg" alt="logo" width={32} height={32} />
//           <span className="hidden lg:block font-bold dark:text-dark-text">
//             School
//           </span>
//         </Link>
//         <Menu />
//       </div>
//       {/* RIGHT */}
//       <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] dark:bg-dark-bg flex flex-col flex-1">
//         <Navbar />
//         <div className="flex-1 overflow-y-auto">{children}</div>
//       </div>
//     </div>
//   );
// }
