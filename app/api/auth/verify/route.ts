 // app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?error=missing", req.url)
      )
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: { verifyToken: token } as any,
    }) as any

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid", req.url)
      )
    }

    // Check if token expired
    if (user.verifyTokenExp && user.verifyTokenExp < new Date()) {
      return NextResponse.redirect(
        new URL("/verify-email?error=expired", req.url)
      )
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified:  true,
        verifyToken:    null,
        verifyTokenExp: null,
      },
    })

    return NextResponse.redirect(
      new URL("/verify-email?success=true", req.url)
    )

  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.redirect(
      new URL("/verify-email?error=server", req.url)
    )
  }
}
