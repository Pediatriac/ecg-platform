 // app/api/doctor/assign/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { caseId } = await req.json()

    const updated = await prisma.case.update({
      where: { id: caseId },
      data: { assignedTo: session.user.id },
    })

    await prisma.eCGUpload.update({
      where: { id: updated.ecgUploadId },
      data: { status: "IN_REVIEW" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Assign error:", error)
    return NextResponse.json(
      { error: "Failed to assign case" },
      { status: 500 }
    )
  }
}
