 // app/api/doctor/cases/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { assignedTo: session.user.id },
          { assignedTo: null },
        ],
      },
      include: {
        ecgUpload: {
          include: {
            patient: true,
            payment: true,
          },
        },
        interpretation: true,
        doctor: true,
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Doctor cases error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}
