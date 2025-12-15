import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value),
					);
					response = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						response.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const path = request.nextUrl.pathname;

	// Define Protected Routes
	const isDashboardRoute =
		path.startsWith("/managing-director") ||
		path.startsWith("/secretary") ||
		path.startsWith("/teacher") ||
		path.startsWith("/student") ||
		path.startsWith("/parent") ||
		path.startsWith("/profile") ||
		path.startsWith("/list") ||
		path.startsWith("/finance") ||
		path.startsWith("/settings");

	const redirect = (url: URL) => {
		const redirectResponse = NextResponse.redirect(url);
		const cookiesToSet = response.cookies.getAll();
		cookiesToSet.forEach((cookie) =>
			redirectResponse.cookies.set(cookie.name, cookie.value),
		);
		return redirectResponse;
	};

	// 1. UNAUTHENTICATED USERS -> Redirect to Sign-in if trying to access dashboard
	if (!user) {
		if (isDashboardRoute) {
			return redirect(new URL("/sign-in", request.url));
		}
		// Allow access to public routes ('/', '/sign-in')
		return response;
	}

	// 2. AUTHENTICATED USERS
	// FIX: Only redirect if the user is trying to access the '/sign-in' page.
	// We allow authenticated users to view the landing page ('/').
	if (path.startsWith("/sign-in")) {
		try {
			// Create Admin Client for Role Check (Bypasses RLS)
			const supabaseAdmin = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL!,
				process.env.SUPABASE_SERVICE_ROLE_KEY!,
				{ auth: { persistSession: false } },
			);

			const { data: roleData } = await supabaseAdmin
				.from("user_roles")
				.select("roles(name)")
				.eq("user_id", user.id)
				.single();

			// @ts-ignore
			const roleName = roleData?.roles?.name || roleData?.roles?.[0]?.name;
			const userRole = roleName ? roleName.toLowerCase() : "student";

			const dashboardMap: Record<string, string> = {
				managing_director: "/managing-director",
				secretary: "/secretary",
				system_administrator: "/system-administrator",
				teacher: "/teacher",
				student: "/student",
				parent: "/parent",
			};

			const targetPath = dashboardMap[userRole] || "/student";

			if (path !== targetPath) {
				return redirect(new URL(targetPath, request.url));
			}
		} catch (error) {
			console.error("Middleware Role Fetch Error:", error);
			return redirect(new URL("/student", request.url));
		}
	}

	return response;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};