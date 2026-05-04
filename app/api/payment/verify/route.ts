 // app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendCaseSubmittedEmail } from "@/lib/email"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      )
    }

    // Verify with Paystack
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await res.json()

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      )
    }

    const { metadata } = data.data

    // Check if already processed
    const existing = await prisma.payment.findUnique({
      where: { reference },
    })

    if (existing?.status === "success") {
      return NextResponse.json({ success: true, alreadyProcessed: true })
    }

    // Update payment status
    await prisma.payment.update({
      where: { reference },
      data:  { status: "success", paidAt: new Date() },
    })

    // Update ECG upload status to PAID
    await prisma.eCGUpload.update({
      where: { id: metadata.ecgUploadId },
      data:  { status: "PAID" },
    })

    // Create case
    const existingCase = await prisma.case.findUnique({
      where: { ecgUploadId: metadata.ecgUploadId },
    })

    if (!existingCase) {
      await prisma.case.create({
        data: {
          ecgUploadId: metadata.ecgUploadId,
          priority:    metadata.tier === "URGENT" ? "URGENT" : "STANDARD",
        },
      })
    }

    // Send confirmation email
    try {
      if (metadata.userEmail && metadata.userName) {
        await sendCaseSubmittedEmail(
          metadata.userEmail,
          metadata.userName,
          metadata.patientName,
          metadata.tier
        )
      }
    } catch (emailErr) {
      console.error("Email failed:", emailErr)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
