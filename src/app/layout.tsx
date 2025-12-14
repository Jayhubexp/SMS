import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext"; // 1

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Management System",
	description: "School Management System",
	openGraph: {
		images: [
			{
				url: "https://bolt.new/static/og_default.png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		images: [
			{
				url: "https://bolt.new/static/og_default.png",
			},
		],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body className={inter.className}>
			<ThemeProvider>
				<AuthProvider>{children}</AuthProvider></ThemeProvider>
			</body>
		</html>
	);
}

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { ThemeProvider } from "@/context/ThemeContext";
// import { AuthProvider } from "@/context/AuthContext"; // 1. Import AuthProvider

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Mercy School Management System",
//   description: "Official school management system for Mercy School",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//         <ThemeProvider>
//           <AuthProvider>
//             {children}
//           </AuthProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
