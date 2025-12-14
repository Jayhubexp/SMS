// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// // This client has admin privileges. Use ONLY in Server Actions/API Routes.
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
// 	auth: {
// 		autoRefreshToken: false,
// 		persistSession: false,
// 	},
// });

import { createClient } from "@supabase/supabase-js";
import "server-only"; // Add this line!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
	throw new Error("Missing Supabase URL or Service Role Key");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});
