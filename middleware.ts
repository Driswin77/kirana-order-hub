import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string;
    const path = req.nextUrl.pathname;

    // 1. Block Retailers from accessing the Order Desk
    if (path.startsWith("/desk") && role !== "ORDER_DESK") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Block Order Desk from accessing Retailer pages (Catalogue, Cart, AI Order)
    if ((path === "/" || path.startsWith("/cart") || path.startsWith("/ai-order")) && role === "ORDER_DESK") {
      return NextResponse.redirect(new URL("/desk", req.url));
    }

    // If no issues, let them through
    return NextResponse.next();
  },
  {
    callbacks: {
      // Only allow access if the user is logged in
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect everything except the login page, API routes, and static files
export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};