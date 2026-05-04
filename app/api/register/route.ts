// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
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

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "PATIENT",
      },
    })

    // Send welcome email (don't block registration if it fails)
    try {
      await sendWelcomeEmail(email, name)
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr)
    }

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

//  // app/api/register/route.ts
// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import bcrypt from "bcryptjs"

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json()
//     const { name, email, password, role } = body

//     // Validate
//     if (!name || !email || !password) {
//       return NextResponse.json(
//         { error: "Name, email and password are required" },
//         { status: 400 }
//       )
//     }

//     if (password.length < 8) {
//       return NextResponse.json(
//         { error: "Password must be at least 8 characters" },
//         { status: 400 }
//       )
//     }

//     // Check duplicate
//     const existing = await prisma.user.findUnique({
//       where: { email },
//     })

//     if (existing) {
//       return NextResponse.json(
//         { error: "An account with this email already exists" },
//         { status: 400 }
//       )
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12)

//     // Create user
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: role || "PATIENT",
//       },
//     })

//     return NextResponse.json({
//       message: "Account created successfully",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     })

//   } catch (error) {
//     console.error("Register error:", error)
//     return NextResponse.json(
//       { error: "Something went wrong. Please try again." },
//       { status: 500 }
//     )
//   }
// }
