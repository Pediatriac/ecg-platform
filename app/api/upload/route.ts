// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf'
]

const VALID_TIERS = ['STANDARD', 'URGENT', 'DETAILED'] as const
type Tier = typeof VALID_TIERS[number]

interface UploadRequest {
  file: File
  fullName: string
  dateOfBirth: string
  gender: string
  symptoms?: string
  tier: Tier
}

function validateFile(file: File): string | null {
  if (!file) return "File is required"

  if (file.size > MAX_FILE_SIZE) {
    return "File size must be less than 10MB"
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "File type not allowed. Please upload JPEG, PNG, GIF, or PDF files"
  }

  return null
}

function validateTier(tier: string): tier is Tier {
  return VALID_TIERS.includes(tier as Tier)
}

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

    // Validate required fields
    if (!file || !fullName || !dateOfBirth || !gender || !tier) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // Validate file
    const fileError = validateFile(file)
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 })
    }

    // Validate tier
    if (!validateTier(tier)) {
      return NextResponse.json(
        { error: "Invalid tier selected" },
        { status: 400 }
      )
    }

    // Validate date
    const birthDate = new Date(dateOfBirth)
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      )
    }

    // Validate gender
    if (!['MALE', 'FEMALE', 'OTHER'].includes(gender.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid gender" },
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

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Create patient record
      const patient = await tx.patient.create({
        data: {
          userId:      session.user.id,
          fullName,
          dateOfBirth: birthDate,
          gender:      gender.toUpperCase(),
          symptoms:    symptoms || "",
        },
      })

      // Create ECG upload record
      const ecgUpload = await tx.eCGUpload.create({
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

      const tierAmounts: Record<Tier, number> = {
        STANDARD: 1000000,
        URGENT:   1500000,
        DETAILED: 2000000,
      }

      const amount = tierAmounts[tier]

      // Save payment record
      const payment = await tx.payment.create({
        data: {
          ecgUploadId: ecgUpload.id,
          userId:      session.user.id,
          amount,
          reference,
          status:      "pending",
        },
      })

      return { patient, ecgUpload, payment, reference, amount }
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
          amount:       result.amount,
          reference:    result.reference,
          callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
          metadata: {
            ecgUploadId: result.ecgUpload.id,
            patientName: fullName,
            tier,
            userName:    session.user.name,
            userEmail:   session.user.email,
          },
        }),
      }
    )

    if (!paystackRes.ok) {
      throw new Error(`Paystack API error: ${paystackRes.status}`)
    }

    const paystackData = await paystackRes.json()

    if (!paystackData.status) {
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success:     true,
      ecgUploadId: result.ecgUpload.id,
      paymentUrl:  paystackData.data.authorization_url,
      reference:   result.reference,
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    )
  }
}