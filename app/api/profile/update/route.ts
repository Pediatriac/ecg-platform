// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, currentPassword, newPassword } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        )
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data:  { name, password: hashedPassword },
      })
    } else {
      await prisma.user.update({
        where: { id: session.user.id },
        data:  { name },
      })
    }

    return NextResponse.json({ success: true, message: "Profile updated" })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}