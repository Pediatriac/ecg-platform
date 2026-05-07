 
// app/api/cases/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { CaseResponse } from "@/types/api"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user?.id) {
      console.error("Session user ID is missing:", session)
      return NextResponse.json({ error: "Invalid session" }, { status: 400 })
    }

    const userId = session.user.id as string
    console.log("Fetching cases for user:", userId)

    // First, let's try a simpler query to test the connection
    const testConnection = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!testConnection) {
      console.error("User not found in database:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User found, fetching ECG uploads...")

    // Try a simpler query first
    const simpleCases = await prisma.eCGUpload.findMany({
      where: {
        patient: {
          userId: userId,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    console.log("Simple query found cases:", simpleCases.length)

    // Now try with includes
    const cases = await prisma.eCGUpload.findMany({
      where: {
        patient: {
          userId: userId,
        },
      },
      include: {
        patient: true,
        payment: true,
        case: {
          include: {
            interpretation: true,            doctor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    console.log("Full query found cases:", cases.length)

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Cases fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}