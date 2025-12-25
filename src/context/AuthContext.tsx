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
			// Normalize role naming to use underscores (e.g., managing_director)
			const normalized = String(roleName).replace(/-/g, "_");
			setRole(normalized);
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
			await supabase.auth.signOut();

			setUser(null);
			setRole(null);
			setFirstName(null);

			// FIX: Redirect to Home Page ('/') instead of Sign-in.
			// This confirms the user is out and lets them see the public page.
			router.replace("/sign-in");
			router.refresh(); 
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
	}, []); 

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