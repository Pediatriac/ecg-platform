// app/api/doctor/notify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { caseId, message, subject } = await req.json()

    if (!caseId || !message || !subject) {
      return NextResponse.json(
        { error: "Case ID, message, and subject are required" },
        { status: 400 }
      )
    }

    // Verify the doctor is assigned to this case
    const caseData = await prisma.case.findFirst({
      where: {
        id: caseId,
        assignedTo: session.user.id,
      },
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

    if (!caseData) {
      return NextResponse.json({ error: "Case not found or not assigned to you" }, { status: 404 })
    }

    const patient = caseData.ecgUpload.patient
    const user = patient?.user

    if (!user) {
      return NextResponse.json({ error: "Patient user not found" }, { status: 404 })
    }

    // Send custom notification email
    const content = `
      <h2 style="color:#9C27B0;margin:0 0 8px;">Update from Dr. ${session.user.name}</h2>
      <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Regarding your ECG case for <strong style="color:white;">${patient.fullName}</strong>
      </p>

      <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;
        border:1px solid #9C27B033;">
        <h3 style="color:#9C27B0;margin:0 0 12px;font-size:14px;">
          Case Update
        </h3>
        <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0;">
          ${message.replace(/\n/g, '<br>')}
        </p>
      </div>

      <a href="${process.env.NEXTAUTH_URL}/dashboard/cases"
        style="display:block;text-align:center;
          background:linear-gradient(135deg,#9C27B0,#E91E8C);
          color:white;text-decoration:none;padding:14px 24px;
          border-radius:10px;font-weight:bold;font-size:15px;">
        View Your Case →
      </a>
    `

    await sendEmail({
      to: user.email,
      subject: `ECG Case Update: ${subject}`,
      html: baseTemplate(content),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Doctor notification error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

// Helper function for email template
function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>My ECGPediatric Portal</title>
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#0a0a0a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#161616;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#E91E8C,#9C27B0);padding:24px;text-align:center;">
                  <h1 style="margin:0;color:white;font-size:22px;font-weight:900;letter-spacing:-0.5px;">
                    My ECG<span style="color:#FFEB3B;">Pediatric</span> Portal
                  </h1>
                  <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;
                    letter-spacing:2px;text-transform:uppercase;">
                    X-Serve Children's Hospital
                  </p>
                </td>
              </tr>

              <!-- Color strip -->
              <tr>
                <td style="padding:0;height:4px;
                  background:linear-gradient(90deg,#E91E8C,#9C27B0,#4CAF50,#00BCD4,#FFEB3B);">
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding:32px;">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #2a2a2a;text-align:center;">
                  <p style="margin:0;color:#666;font-size:12px;">
                    © 2026 X-Serve Children's Hospital · Lagos, Nigeria
                  </p>
                  <p style="margin:4px 0 0;color:#444;font-size:11px;">
                    This is an automated message from My ECGPediatric Portal
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}