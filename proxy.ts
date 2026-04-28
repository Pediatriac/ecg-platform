 
// proxy.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    // Block non-admins from /admin routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Block non-doctors from /doctor routes
    if (pathname.startsWith("/doctor") && role !== "DOCTOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Which routes this proxy protects
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/doctor/:path*",
    "/admin/:path*",
  ],
}