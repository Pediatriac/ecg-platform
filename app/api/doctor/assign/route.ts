// app/api/doctor/assign/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendDoctorAssignedEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { caseId } = await req.json()

    // Update case — assign to this doctor
    const updated = await prisma.case.update({
      where: { id: caseId },
      data: { assignedTo: session.user.id },
    })

    // Update ECG status to IN_REVIEW
    await prisma.eCGUpload.update({
      where: { id: updated.ecgUploadId },
      data: { status: "IN_REVIEW" },
    })

    // Notify doctor of new assignment (non-blocking)
    try {
      const fullCase = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          doctor: true,
          ecgUpload: {
            include: {
              patient: true,
            },
          },
        },
      })

      if (fullCase?.doctor && fullCase?.ecgUpload?.patient) {
        await sendDoctorAssignedEmail(
          fullCase.doctor.email,
          fullCase.doctor.name,
          fullCase.ecgUpload.patient.fullName,
          new Date(fullCase.ecgUpload.patient.dateOfBirth).toLocaleDateString(),
          fullCase.ecgUpload.patient.gender,
          fullCase.ecgUpload.patient.symptoms || "",
          fullCase.priority,
          fullCase.ecgUpload.fileUrl
        )
      }
    } catch (emailErr) {
      // Email failure should never block the assignment
      console.error("Doctor assigned email failed:", emailErr)
    }

    // This is now correctly OUTSIDE the email try/catch
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Assign error:", error)
    return NextResponse.json(
      { error: "Failed to assign case" },
      { status: 500 }
    )
  }
}