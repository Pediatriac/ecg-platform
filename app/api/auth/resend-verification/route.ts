 // app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } }) as any

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    // Generate new token
    const verifyToken    = crypto.randomBytes(32).toString("hex")
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data:  { verifyToken, verifyTokenExp },
    })

    await sendVerificationEmail(email, user.name, verifyToken)

    return NextResponse.json({
      message: "Verification email sent! Please check your inbox.",
    })

  } catch (error) {
    console.error("Resend error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
