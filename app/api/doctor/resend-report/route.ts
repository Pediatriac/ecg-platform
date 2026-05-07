// app/api/doctor/resend-report/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendReportReadyEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { caseId } = await req.json()
    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    const fullCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        ecgUpload: {
          include: {
            patient: {
              include: { user: true },
            },
          },
        },
        interpretation: true,
      },
    })

    if (!fullCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    if (!fullCase.interpretation) {
      return NextResponse.json({ error: "No interpretation found for this case" }, { status: 400 })
    }

    const patient = fullCase.ecgUpload.patient
    const user = patient?.user

    if (!user || !patient) {
      return NextResponse.json({ error: "Patient account not found" }, { status: 404 })
    }

    await sendReportReadyEmail(
      user.email,
      user.name || "Patient",
      patient.fullName,
      fullCase.interpretation.riskLevel,
      fullCase.interpretation.conclusion
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resend report error:", error)
    return NextResponse.json(
      { error: "Failed to resend report notification" },
      { status: 500 }
    )
  }
}
