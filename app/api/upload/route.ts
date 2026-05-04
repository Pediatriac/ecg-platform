// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData    = await req.formData()
    const file        = formData.get("file")        as File
    const fullName    = formData.get("fullName")    as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const gender      = formData.get("gender")      as string
    const symptoms    = formData.get("symptoms")    as string
    const tier        = formData.get("tier")        as string

    if (!file || !fullName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // Convert file to base64 and upload to Cloudinary
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const uploaded = await cloudinary.uploader.upload(base64, {
      folder:        "ecg-reports",
      resource_type: "auto",
    })

    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        userId:      session.user.id,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        symptoms:    symptoms || "",
      },
    })

    // Create ECG upload record
    const ecgUpload = await prisma.eCGUpload.create({
      data: {
        patientId: patient.id,
        fileUrl:   uploaded.secure_url,
        fileType:  file.type,
        status:    "PENDING",
      },
    })

    // Create payment reference
    const reference = `ECG-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)
      .toUpperCase()}`

    const tierAmounts: Record<string, number> = {
      STANDARD: 1000000,
      URGENT:   1500000,
      DETAILED: 2000000,
    }

    const amount = tierAmounts[tier] || 1000000

    // Save payment record
    await prisma.payment.create({
      data: {
        ecgUploadId: ecgUpload.id,
        userId:      session.user.id,
        amount,
        reference,
        status:      "pending",
      },
    })

    // Initialize Paystack payment
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email:        session.user.email,
          amount,
          reference,
          callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`, // ✅ updated
          metadata: {
            ecgUploadId: ecgUpload.id,
            patientName: fullName,
            tier,
            userName:    session.user.name,
            userEmail:   session.user.email,
          },
        }),
      }
    )

    const paystackData = await paystackRes.json()

    if (!paystackData.status) {
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success:     true,
      ecgUploadId: ecgUpload.id,
      paymentUrl:  paystackData.data.authorization_url,
      reference,
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    )
  }
}