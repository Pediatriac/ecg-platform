 // app/api/admin/cases/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cases = await prisma.case.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ecgUpload: {
          include: {
            patient: true,
            payment: true,
          },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
        interpretation: true,
      },
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("Admin cases error:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { caseId, doctorId } = await req.json()

    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: { id: true },
    })

    if (!doctors.find((d) => d.id === doctorId)) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const updated = await prisma.case.update({
      where: { id: caseId },
      data: { assignedTo: doctorId },
    })

    await prisma.eCGUpload.update({
      where: { id: updated.ecgUploadId },
      data: { status: "ASSIGNED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin assign error:", error)
    return NextResponse.json({ error: "Failed to assign case" }, { status: 500 })
  }
}
