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

	// Create Admin Client for Role Check (Bypasses RLS)
	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{ auth: { persistSession: false } },
	);

	const path = request.nextUrl.pathname;
	const isPublicRoute = path === "/" || path.startsWith("/sign-in");

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

	// 1. UNAUTHENTICATED USERS -> Redirect to Sign-in
	if (!user) {
		if (isDashboardRoute) {
			return redirect(new URL("/sign-in", request.url));
		}
		return response;
	}

	// 2. AUTHENTICATED USERS
	// Note: We removed the forced password change check here to allow optional updates later.

	// Redirect away from Public Routes (Login/Home) to Dashboard
	if (isPublicRoute) {
		try {
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

// import { createServerClient } from "@supabase/ssr";
// import { createClient } from "@supabase/supabase-js";
// import { type NextRequest, NextResponse } from "next/server";

// export async function middleware(request: NextRequest) {
// 	// 1. Initialize Response
// 	let response = NextResponse.next({
// 		request: {
// 			headers: request.headers,
// 		},
// 	});

// 	// 2. Create Supabase Client (Handles Auth Cookies)
// 	const supabase = createServerClient(
// 		process.env.NEXT_PUBLIC_SUPABASE_URL!,
// 		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// 		{
// 			cookies: {
// 				getAll() {
// 					return request.cookies.getAll();
// 				},
// 				setAll(cookiesToSet) {
// 					cookiesToSet.forEach(({ name, value, options }) =>
// 						request.cookies.set(name, value),
// 					);
// 					response = NextResponse.next({
// 						request,
// 					});
// 					cookiesToSet.forEach(({ name, value, options }) =>
// 						response.cookies.set(name, value, options),
// 					);
// 				},
// 			},
// 		},
// 	);

// 	// 3. Refresh Session & Get User
// 	// This updates the auth cookie if needed
// 	const {
// 		data: { user },
// 	} = await supabase.auth.getUser();

// 	// 4. Define Paths
// 	const path = request.nextUrl.pathname;
// 	const isPublicRoute = path === "/" || path.startsWith("/sign-in");

// 	// Dashboard/Protected Routes
// 	const isDashboardRoute =
// 		path.startsWith("/managing-director") ||
// 		path.startsWith("/secretary") ||
// 		path.startsWith("/teacher") ||
// 		path.startsWith("/student") ||
// 		path.startsWith("/parent") ||
// 		path.startsWith("/profile") ||
// 		path.startsWith("/list") ||
// 		path.startsWith("/finance") ||
// 		path.startsWith("/settings");

// 	// Helper: Redirect with cookies preserved
// 	const redirect = (url: URL) => {
// 		const redirectResponse = NextResponse.redirect(url);
// 		const cookiesToSet = response.cookies.getAll();
// 		cookiesToSet.forEach((cookie) =>
// 			redirectResponse.cookies.set(cookie.name, cookie.value),
// 		);
// 		return redirectResponse;
// 	};

// 	// --- LOGIC BLOCK 1: UNAUTHENTICATED USERS ---

// 	if (!user) {
// 		// If trying to access a protected route, redirect to sign-in
// 		if (isDashboardRoute) {
// 			return redirect(new URL("/sign-in", request.url));
// 		}
// 		// Allow public routes (Landing page / Sign-in)
// 		return response;
// 	}

// 	// --- LOGIC BLOCK 2: AUTHENTICATED USERS ---

// 	// Redirect authenticated users away from Public Routes (Login/Home) to Dashboard
// 	if (isPublicRoute) {
// 		try {
// 			// Create Admin Client for Role Check (Bypasses RLS)
// 			// Only created if needed to save resources
// 			const supabaseAdmin = createClient(
// 				process.env.NEXT_PUBLIC_SUPABASE_URL!,
// 				process.env.SUPABASE_SERVICE_ROLE_KEY!,
// 				{ auth: { persistSession: false } },
// 			);

// 			const { data: roleData } = await supabaseAdmin
// 				.from("user_roles")
// 				.select("roles(name)")
// 				.eq("user_id", user.id)
// 				.single();

// 			// @ts-ignore
// 			const roleName = roleData?.roles?.name || roleData?.roles?.[0]?.name;
// 			const userRole = roleName ? roleName.toLowerCase() : "student";

// 			const dashboardMap: Record<string, string> = {
// 				managing_director: "/managing-director",
// 				secretary: "/secretary",
// 				system_administrator: "/system-administrator",
// 				teacher: "/teacher",
// 				student: "/student",
// 				parent: "/parent",
// 			};

// 			const targetPath = dashboardMap[userRole] || "/student";

// 			// Only redirect if not already there
// 			if (path !== targetPath) {
// 				return redirect(new URL(targetPath, request.url));
// 			}
// 		} catch (error) {
// 			console.error("Middleware Role Fetch Error:", error);
// 			// Fallback to student if role fetch fails
// 			return redirect(new URL("/student", request.url));
// 		}
// 	}

// 	return response;
// }

// export const config = {
// 	matcher: [
// 		/*
// 		 * Match all request paths except for:
// 		 * - _next/static (static files)
// 		 * - _next/image (image optimization files)
// 		 * - favicon.ico (favicon file)
// 		 * - public folder assets (images, etc)
// 		 * - api routes (if any are public)
// 		 */
// 		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
// 	],
// };

// import { type NextRequest, NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// export async function middleware(request: NextRequest) {
// 	// 1. Create an initial response
// 	let supabaseResponse = NextResponse.next({
// 		request,
// 	});

// 	const supabase = createServerClient(
// 		process.env.NEXT_PUBLIC_SUPABASE_URL!,
// 		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// 		{
// 			cookies: {
// 				getAll() {
// 					return request.cookies.getAll();
// 				},
// 				setAll(cookiesToSet) {
// 					// Fix: Update both the Request (for the app) and Response (for the browser)
// 					cookiesToSet.forEach(({ name, value, options }) =>
// 						request.cookies.set(name, value),
// 					);

// 					supabaseResponse = NextResponse.next({
// 						request,
// 					});

// 					cookiesToSet.forEach(({ name, value, options }) =>
// 						supabaseResponse.cookies.set(name, value, options),
// 					);
// 				},
// 			},
// 		},
// 	);

// 	// 2. Refresh Session
// 	// This will trigger 'setAll' if the token needs refreshing
// 	const {
// 		data: { user },
// 	} = await supabase.auth.getUser();

// 	return supabaseResponse;
// }

// export const config = {
// 	matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api).*)"],
// };
