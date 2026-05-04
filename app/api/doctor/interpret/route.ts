// app/api/doctor/interpret/route.ts
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

    const {
      caseId,
      rhythm,
      rate,
      axis,
      intervals,
      findings,
      conclusion,
      riskLevel,
      recommendations,
    } = await req.json()

    if (!caseId || !findings || !conclusion || !riskLevel) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      )
    }

    // Assign case to this doctor if not already assigned
    await prisma.case.update({
      where: { id: caseId },
      data: {
        assignedTo: session.user.id,
        completedAt: new Date(),
      },
    })

    // Create interpretation
    const interpretation = await prisma.interpretation.create({
      data: {
        caseId,
        doctorId: session.user.id,
        rhythm: rhythm || "",
        rate: rate || "",
        axis: axis || "",
        findings,
        conclusion,
        riskLevel,
      },
    })

    // Fetch case data FIRST — needed for both status update and email
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        ecgUpload: {
          include: {
            patient: {
              include: { user: true },
            },
          },
        },
      },
    })

    // Update ECG upload status to COMPLETED
    if (caseData) {
      await prisma.eCGUpload.update({
        where: { id: caseData.ecgUploadId },
        data: { status: "COMPLETED" },
      })
    }

    // Notify patient that report is ready (non-blocking)
    try {
      const patient  = caseData?.ecgUpload?.patient
      const user     = patient?.user

      if (user && patient) {
        await sendReportReadyEmail(
          user.email,
          user.name  || "Patient",
          patient.fullName,
          riskLevel,
          conclusion
        )
      }
    } catch (emailErr) {
      console.error("Report ready email failed:", emailErr)
    }

    return NextResponse.json({
      success: true,
      interpretation,
    })

  } catch (error) {
    console.error("Interpretation error:", error)
    return NextResponse.json(
      { error: "Failed to save interpretation" },
      { status: 500 }
    )
  }
}