 
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

    const cases = await prisma.eCGUpload.findMany({
      where: {
        patient: {
          userId: session.user.id,
        },
      },
      include: {
        patient: true,
        payment: true,
        case: {
          include: {
            interpretation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Cases fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}