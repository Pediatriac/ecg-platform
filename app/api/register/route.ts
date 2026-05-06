// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"
import { RegisterRequest } from "@/types/api"

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verifyToken    = crypto.randomBytes(32).toString("hex")
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user — not verified yet
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:      hashedPassword,
        role:          role || "PATIENT",
        emailVerified: false,
        verifyToken,
        verifyTokenExp,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verifyToken)
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr)
    }

    return NextResponse.json({
      message: "Account created! Please check your email to verify your account.",
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    })

  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

