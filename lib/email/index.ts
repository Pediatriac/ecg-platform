// lib/email/index.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.EMAIL_FROM || "onboarding@resend.dev"
const DEV_TO = process.env.RESEND_TEST_EMAIL

// In development — all emails go to RESEND_TEST_EMAIL
// In production — emails go to the actual recipient
function getTo(email: string): string {
  return process.env.NODE_ENV === "production" ? email : (DEV_TO || email)
}

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

// ── Welcome email after registration ─────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  const content = `
    <h2 style="color:#E91E8C;margin:0 0 8px;">Welcome, ${name}! 👋</h2>
    <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Your account has been created successfully on My ECGPediatric Portal.
      You can now upload ECG reports for professional interpretation.
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;
      border:1px solid #E91E8C33;">
      <h3 style="color:#E91E8C;margin:0 0 12px;font-size:14px;
        text-transform:uppercase;letter-spacing:1px;">
        Getting Started
      </h3>
      ${[
        { step: "1", text: "Upload your child's ECG report",  color: "#E91E8C" },
        { step: "2", text: "Select an interpretation tier",   color: "#9C27B0" },
        { step: "3", text: "Complete secure online payment",  color: "#FFEB3B" },
        { step: "4", text: "Receive expert interpretation",   color: "#4CAF50" },
      ].map(s => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <div style="width:24px;height:24px;border-radius:50%;
            background:${s.color}22;border:1.5px solid ${s.color};
            display:flex;align-items:center;justify-content:center;
            color:${s.color};font-size:11px;font-weight:bold;
            flex-shrink:0;text-align:center;line-height:24px;">
            ${s.step}
          </div>
          <span style="color:#ccc;font-size:14px;">${s.text}</span>
        </div>
      `).join("")}
    </div>

    <a href="${process.env.NEXTAUTH_URL}/dashboard"
      style="display:block;text-align:center;
        background:linear-gradient(135deg,#E91E8C,#9C27B0);
        color:white;text-decoration:none;padding:14px 24px;
        border-radius:10px;font-weight:bold;font-size:15px;">
      Go to My Dashboard →
    </a>
  `

  return resend.emails.send({
    from:    FROM,
    to:      getTo(to),
    subject: "Welcome to My ECGPediatric Portal 🫀",
    html:    baseTemplate(content),
  })
}

// ── Case submitted confirmation ───────────────────────────────────
export async function sendCaseSubmittedEmail(
  to:          string,
  userName:    string,
  patientName: string,
  tier:        string
) {
  const content = `
    <h2 style="color:#00BCD4;margin:0 0 8px;">ECG Case Submitted ✅</h2>
    <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${userName}, your ECG submission for
      <strong style="color:white;">${patientName}</strong>
      has been received and payment confirmed.
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;
      margin:0 0 24px;border:1px solid #00BCD433;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">Patient</td>
          <td style="color:white;font-size:13px;font-weight:bold;
            text-align:right;">${patientName}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">Service Tier</td>
          <td style="color:#FFEB3B;font-size:13px;font-weight:bold;
            text-align:right;">${tier}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">Status</td>
          <td style="color:#4CAF50;font-size:13px;font-weight:bold;
            text-align:right;">Paid & Queued</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">
            Expected Turnaround
          </td>
          <td style="color:#00BCD4;font-size:13px;font-weight:bold;
            text-align:right;">
            ${tier === "URGENT"
              ? "6 hours"
              : tier === "DETAILED"
              ? "48 hours + notes"
              : "48 hours"}
          </td>
        </tr>
      </table>
    </div>

    <p style="color:#888;font-size:13px;margin:0 0 20px;">
      You will receive another email when your interpretation report is ready.
      You can also track your case status on your dashboard.
    </p>

    <a href="${process.env.NEXTAUTH_URL}/dashboard/cases"
      style="display:block;text-align:center;
        background:linear-gradient(135deg,#00BCD4,#4CAF50);
        color:white;text-decoration:none;padding:14px 24px;
        border-radius:10px;font-weight:bold;font-size:15px;">
      Track My Case →
    </a>
  `

  return resend.emails.send({
    from:    FROM,
    to:      getTo(to),
    subject: `ECG Submitted for ${patientName} — Payment Confirmed 💳`,
    html:    baseTemplate(content),
  })
}

// ── Doctor notification — new case assigned ───────────────────────
export async function sendDoctorAssignedEmail(
  to:            string,
  doctorName:    string,
  patientName:   string,
  patientDob:    string,
  patientGender: string,
  symptoms:      string,
  priority:      string,
  ecgFileUrl:    string
) {
  const content = `
    <h2 style="color:#9C27B0;margin:0 0 8px;">New ECG Case Assigned 👨‍⚕️</h2>
    <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Dr. ${doctorName}, a new ECG case has been assigned to you
      and requires your interpretation.
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;
      border:1px solid ${priority === "URGENT" ? "#E91E8C" : "#9C27B0"}33;">
      <h3 style="color:${priority === "URGENT" ? "#E91E8C" : "#9C27B0"};
        margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
        ${priority === "URGENT" ? "⚡ URGENT CASE" : "📋 Standard Case"}
      </h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">Patient</td>
          <td style="color:white;font-size:13px;font-weight:bold;
            text-align:right;">${patientName}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">Date of Birth</td>
          <td style="color:#ccc;font-size:13px;
            text-align:right;">${patientDob}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">Gender</td>
          <td style="color:#ccc;font-size:13px;
            text-align:right;">${patientGender}</td>
        </tr>
        ${symptoms ? `
        <tr>
          <td style="color:#888;font-size:13px;padding:6px 0;">Symptoms</td>
          <td style="color:#9C27B0;font-size:13px;
            text-align:right;">${symptoms}</td>
        </tr>` : ""}
      </table>
    </div>

    <a href="${ecgFileUrl}" target="_blank"
      style="display:block;text-align:center;
        background:linear-gradient(135deg,#00BCD4,#4CAF50);
        color:white;text-decoration:none;padding:12px 24px;
        border-radius:10px;font-weight:bold;font-size:14px;margin-bottom:12px;">
      📎 View ECG File
    </a>

    <a href="${process.env.NEXTAUTH_URL}/doctor"
      style="display:block;text-align:center;
        background:linear-gradient(135deg,#9C27B0,#E91E8C);
        color:white;text-decoration:none;padding:14px 24px;
        border-radius:10px;font-weight:bold;font-size:15px;">
      Open Doctor Dashboard →
    </a>
  `

  return resend.emails.send({
    from:    FROM,
    to:      getTo(to),
    subject: `${priority === "URGENT" ? "⚡ URGENT: " : ""}New ECG Case — ${patientName}`,
    html:    baseTemplate(content),
  })
}

// ── Report ready notification to patient ─────────────────────────
export async function sendReportReadyEmail(
  to:          string,
  userName:    string,
  patientName: string,
  riskLevel:   string,
  conclusion:  string
) {
  const riskColors: Record<string, string> = {
    NORMAL:   "#4CAF50",
    LOW:      "#00BCD4",
    MODERATE: "#FFEB3B",
    HIGH:     "#E91E8C",
    CRITICAL: "#ff1744",
  }

  const riskColor = riskColors[riskLevel] || "#4CAF50"

  const content = `
    <h2 style="color:#4CAF50;margin:0 0 8px;">Your ECG Report is Ready 📄</h2>
    <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${userName}, the ECG interpretation for
      <strong style="color:white;">${patientName}</strong>
      has been completed by our pediatric cardiologist.
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;
      margin:0 0 24px;border:1px solid ${riskColor}33;">
      <h3 style="color:${riskColor};margin:0 0 12px;font-size:14px;
        text-transform:uppercase;letter-spacing:1px;">
        Risk Level: ${riskLevel}
      </h3>
      <p style="color:#ccc;font-size:14px;line-height:1.6;margin:0;">
        ${conclusion}
      </p>
    </div>

    ${riskLevel === "HIGH" || riskLevel === "CRITICAL" ? `
    <div style="background:#2d0a0a;border-radius:12px;padding:16px;
      margin:0 0 20px;border:1px solid #E91E8C55;">
      <p style="color:#f87171;font-size:13px;margin:0;font-weight:bold;">
        ⚠ Important: This case has been flagged as ${riskLevel} risk.
        Please consult with a cardiologist immediately.
      </p>
    </div>` : ""}

    <a href="${process.env.NEXTAUTH_URL}/dashboard/cases"
      style="display:block;text-align:center;
        background:linear-gradient(135deg,#4CAF50,#00BCD4);
        color:white;text-decoration:none;padding:14px 24px;
        border-radius:10px;font-weight:bold;font-size:15px;">
      Download Full Report →
    </a>
  `

  return resend.emails.send({
    from:    FROM,
    to:      getTo(to),
    subject: `ECG Report Ready for ${patientName} 📄`,
    html:    baseTemplate(content),
  })
}