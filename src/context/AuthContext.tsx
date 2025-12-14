"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthContextType {
	user: User | null;
	role: string | null;
	firstName: string | null;
	loading: boolean;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [firstName, setFirstName] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Define these functions BEFORE useEffect so they are accessible
	const fetchUserRole = async (uid: string) => {
		try {
			const { data, error } = await supabase
				.from("user_roles")
				.select("roles(name)")
				.eq("user_id", uid)
				.single();

			if (error && error.code !== "PGRST116") {
				console.error("Role fetch error:", error);
			}

			// @ts-ignore
			const roleName = data?.roles?.name || data?.roles?.[0]?.name || "student";
			setRole(roleName);
		} catch (error) {
			console.error("Role fetch unexpected error:", error);
			setRole("student");
		}
	};

	const fetchUserMetadata = async (uid: string, authUser: User | null) => {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("first_name")
				.eq("id", uid)
				.single();

			if (error && error.code !== "PGRST116") {
				console.error("Metadata fetch error:", error);
			}

			setFirstName(
				data?.first_name ||
					authUser?.user_metadata?.first_name ||
					authUser?.user_metadata?.name?.split(" ")[0] ||
					null,
			);
		} catch (error) {
			console.error("Metadata fetch unexpected error:", error);
		}
	};

	const logout = async () => {
		try {
			setLoading(true);
			// Remove { scope: "local" } to ensure server-side cookies are cleared too
			await supabase.auth.signOut();

			setUser(null);
			setRole(null);
			setFirstName(null);

			router.replace("/sign-in");
			router.refresh(); // Critical for clearing Middleware cache
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let mounted = true;

		const initSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (session?.user && mounted) {
					setUser(session.user);
					// Now fetchUserRole is defined and can be called
					await Promise.all([
						fetchUserRole(session.user.id),
						fetchUserMetadata(session.user.id, session.user),
					]);
				}
			} catch (error) {
				console.error("Session init error:", error);
			} finally {
				if (mounted) setLoading(false);
			}
		};

		initSession();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (_event, session) => {
				if (!mounted) return;

				if (session?.user) {
					setUser(session.user);
					// Only fetch if data is missing or user changed to save bandwidth
					if (!role || user?.id !== session.user.id) {
						await Promise.all([
							fetchUserRole(session.user.id),
							fetchUserMetadata(session.user.id, session.user),
						]);
					}
				} else {
					setUser(null);
					setRole(null);
					setFirstName(null);
				}

				if (mounted) setLoading(false);
			},
		);

		return () => {
			mounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []); // Empty dependency array is fine here as we track internal state

	return (
		<AuthContext.Provider value={{ user, role, firstName, loading, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// "use client";

// import {
// 	createContext,
// 	useContext,
// 	useEffect,
// 	useState,
// 	ReactNode,
// } from "react";
// import { supabase } from "@/lib/supabase";
// import { User } from "@supabase/supabase-js";
// import { useRouter, usePathname } from "next/navigation";

// interface AuthContextType {
// 	user: User | null;
// 	role: string | null;
// 	firstName: string | null;
// 	loading: boolean;
// 	logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
// 	const [user, setUser] = useState<User | null>(null);
// 	const [role, setRole] = useState<string | null>(null);
// 	const [firstName, setFirstName] = useState<string | null>(null);
// 	const [loading, setLoading] = useState(true);
// 	const router = useRouter();
// 	const pathname = usePathname();

// 	useEffect(() => {
// 		const checkSession = async () => {
// 			const {
// 				data: { session },
// 			} = await supabase.auth.getSession();

// 			if (session?.user) {
// 				setUser(session.user);
// 				// Prioritize metadata for speed, fallback to DB if needed
// 				const metaRole = session.user.user_metadata?.role;
// 				const metaName = session.user.user_metadata?.firstName;

// 				if (metaRole) setRole(metaRole);
// 				else await fetchUserRole(session.user.id);

// 				if (metaName) setFirstName(metaName);
// 				else await fetchUserMetadata(session.user.id);
// 			}
// 			setLoading(false);
// 		};

// 		checkSession();

// 		const { data: authListener } = supabase.auth.onAuthStateChange(
// 			async (event, session) => {
// 				if (session?.user) {
// 					setUser(session.user);
// 					const metaRole = session.user.user_metadata?.role;
// 					if (metaRole) setRole(metaRole);
// 					else await fetchUserRole(session.user.id);

// 					const metaName = session.user.user_metadata?.firstName;
// 					if (metaName) setFirstName(metaName);
// 					else await fetchUserMetadata(session.user.id);
// 				} else if (event === "SIGNED_OUT") {
// 					setUser(null);
// 					setRole(null);
// 					setFirstName(null);
// 					router.replace("/sign-in");
// 				}
// 				setLoading(false);
// 			},
// 		);

// 		return () => {
// 			authListener.subscription.unsubscribe();
// 		};
// 	}, [router]);

// 	const fetchUserRole = async (uid: string) => {
// 		try {
// 			const { data, error } = await supabase
// 				.from("user_roles")
// 				.select("roles(name)")
// 				.eq("user_id", uid)
// 				.single();

// 			if (data?.roles) {
// 				// @ts-ignore
// 				const roleName = data.roles.name || data.roles[0]?.name;
// 				setRole(roleName);
// 			}
// 		} catch (err) {
// 			console.error("Error fetching role:", err);
// 		}
// 	};

// 	const fetchUserMetadata = async (uid: string) => {
// 		try {
// 			const { data } = await supabase
// 				.from("users")
// 				.select("first_name")
// 				.eq("id", uid)
// 				.single();
// 			if (data) setFirstName(data.first_name);
// 		} catch (err) {
// 			console.error("Error fetching metadata:", err);
// 		}
// 	};

// 	const logout = async () => {
// 		await supabase.auth.signOut();
// 	};

// 	return (
// 		<AuthContext.Provider value={{ user, role, firstName, loading, logout }}>
// 			{!loading && children}
// 		</AuthContext.Provider>
// 	);
// };

// export const useAuth = () => {
// 	const context = useContext(AuthContext);
// 	if (context === undefined) {
// 		throw new Error("useAuth must be used within an AuthProvider");
// 	}
// 	return context;
// };
