
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
	ArrowRight,
	GraduationCap,
	School,
	Users,
	BookOpen,
	Award,
	Globe,
	Shield,
	Loader as Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
	const { loading } = useAuth();

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white'>
				<div className='text-center'>
					<Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-blue-600' />
					<p className='text-gray-600'>Loading...</p>
				</div>
			</div>
		);
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.2 },
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: "spring" as const,
				stiffness: 100,
			},
		},
	};

	const statsVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delay: 0.8,
			},
		},
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden text-slate-800 relative'>
			{/* Animated Background Blobs */}
			<div className='absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none'>
				<motion.div
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className='absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl'
				/>
				<motion.div
					animate={{
						scale: [1.1, 1, 1.1],
						opacity: [0.4, 0.6, 0.4],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 2,
					}}
					className='absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-gradient-to-l from-blue-300/30 to-purple-200/30 rounded-full blur-3xl'
				/>
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 4,
					}}
					className='absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl'
				/>
			</div>

			{/* Navigation */}
			<motion.nav
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6 }}
				className='flex justify-between items-center p-6 max-w-7xl mx-auto relative z-20'>
				<motion.div
					whileHover={{ scale: 1.05 }}
					className='flex items-center gap-2'>
					<motion.div
						whileHover={{ rotate: 360 }}
						transition={{ duration: 0.6 }}
						className='bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg'>
						<School className='text-white w-6 h-6' />
					</motion.div>
					<span className='text-xl font-bold text-blue-900 tracking-tight'>
						Mercy Schools
					</span>
				</motion.div>
				<Link href='/sign-in'>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='px-6 py-2 rounded-full bg-white text-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all border border-blue-100 hover:border-blue-200'>
						Sign In
					</motion.button>
				</Link>
			</motion.nav>

			{/* Hero Section */}
			<main className='flex flex-col items-center justify-center text-center mt-12 px-4 relative z-10'>
				<motion.div
					variants={containerVariants}
					initial='hidden'
					animate='visible'
					className='max-w-4xl mx-auto'>
					<motion.div variants={itemVariants} className='mb-4 inline-block'>
						<span className='px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium shadow-sm'>
							Excellence in Education
						</span>
					</motion.div>

					<motion.h1
						variants={itemVariants}
						className='text-5xl md:text-7xl font-extrabold text-blue-950 mb-6 leading-tight bg-gradient-to-r from-blue-950 to-blue-800 bg-clip-text text-transparent'>
						Welcome to <br />
						<span className='bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent'>
							Mercy Schools Limited
						</span>
					</motion.h1>

					<motion.p
						variants={itemVariants}
						className='text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium'>
						Empowering the next generation with world-class management tools,
						academic excellence, and a community-driven approach to learning.
					</motion.p>

					<motion.div variants={itemVariants}>
						<Link href='/sign-in'>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className='group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto overflow-hidden border border-blue-500'>
								<span className='relative z-10'>Access Portal</span>
								<ArrowRight className='w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform' />
								<div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
							</motion.button>
						</Link>
					</motion.div>
				</motion.div>

				{/* Stats Section */}
				<motion.div
					variants={statsVariants}
					initial='hidden'
					animate='visible'
					className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto w-full px-4'>
					{[
						{ number: "500+", label: "Students" },
						{ number: "50+", label: "Teachers" },
						{ number: "15+", label: "Years" },
						{ number: "98%", label: "Success Rate" },
					].map((stat, idx) => (
						<motion.div
							key={idx}
							whileHover={{ y: -5 }}
							className='text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg'>
							<div className='text-2xl md:text-3xl font-bold text-blue-600 mb-1'>
								{stat.number}
							</div>
							<div className='text-sm text-slate-600 font-medium'>
								{stat.label}
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Feature Cards */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8, duration: 0.8 }}
					className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto w-full px-4'>
					{[
						{
							icon: Users,
							title: "Student Portal",
							desc: "Access grades, schedules, and assignments instantly.",
							color: "from-blue-500 to-blue-600",
						},
						{
							icon: GraduationCap,
							title: "Teacher Hub",
							desc: "Manage classes and track student progress seamlessly.",
							color: "from-indigo-500 to-indigo-600",
						},
						{
							icon: School,
							title: "Administration",
							desc: "Streamline school operations and financial reporting.",
							color: "from-purple-500 to-purple-600",
						},
					].map((item, idx) => (
						<motion.div
							key={idx}
							whileHover={{ y: -8, scale: 1.02 }}
							className='bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-50 hover:shadow-2xl transition-all duration-300 group'>
							<div
								className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
								<item.icon className='text-white w-6 h-6' />
							</div>
							<h3 className='text-xl font-bold text-slate-800 mb-2'>
								{item.title}
							</h3>
							<p className='text-slate-600 leading-relaxed'>{item.desc}</p>
						</motion.div>
					))}
				</motion.div>

				{/* Additional Features */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.0, duration: 0.8 }}
					className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto w-full px-4'>
					{[
						{ icon: BookOpen, title: "Digital Library" },
						{ icon: Award, title: "Achievements" },
						{ icon: Globe, title: "Global Standards" },
						{ icon: Shield, title: "Secure Platform" },
					].map((feature, idx) => (
						<motion.div
							key={idx}
							whileHover={{ scale: 1.05 }}
							className='flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300'>
							<feature.icon className='w-8 h-8 text-blue-600 mb-2' />
							<span className='text-sm font-medium text-slate-700 text-center'>
								{feature.title}
							</span>
						</motion.div>
					))}
				</motion.div>

				{/* Call to Action */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.2, duration: 0.8 }}
					className='mt-20 mb-16 text-center'>
					<h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-4'>
						Ready to Get Started?
					</h2>
					<p className='text-slate-600 mb-6 max-w-md mx-auto'>
						Join thousands of students, teachers, and administrators who trust
						our platform.
					</p>
					<Link href='/sign-in'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all'>
							Get Started Today
						</motion.button>
					</Link>
				</motion.div>
			</main>
		</div>
	);
}

