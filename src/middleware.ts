import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";

export default async function authMiddleware(req: NextRequest) {
	const { nextUrl } = req;
	const session = await auth();
	const isLoggedIn = !!session;
	const user = session?.user;

	// Skip middleware for auth routes and API routes
	const isApiRoute = nextUrl.pathname.startsWith("/api");
	const isAuthRoute = nextUrl.pathname.startsWith("/auth");
	const isProfileRoute = nextUrl.pathname === "/profile";

	if (isApiRoute || isAuthRoute) {
		return NextResponse.next();
	}

	// If user is logged in but doesn't have a name, redirect to profile page
	if (isLoggedIn && user && (!user.name || user.name.trim() === "")) {
		if (!isProfileRoute) {
			const profileUrl = new URL("/profile", nextUrl.origin);
			profileUrl.searchParams.set("setup", "true");
			return NextResponse.redirect(profileUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
