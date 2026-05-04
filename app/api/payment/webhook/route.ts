// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendCaseSubmittedEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body      = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data

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

      // Auto-create a case
      await prisma.case.create({
        data: {
          ecgUploadId: metadata.ecgUploadId,
          priority:    metadata.tier === "URGENT" ? "URGENT" : "STANDARD",
        },
      })

      // Send confirmation email AFTER payment confirmed
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
        console.error("Case submitted email failed:", emailErr)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}