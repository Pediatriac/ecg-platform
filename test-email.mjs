// test-email.mjs
import { Resend } from "resend"

const resend = new Resend("re_PLLCAsQr_HJSHowipwez4xcn2y4xvPxGy")

const { data, error } = await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "xservehospitals@gmail.com", // ← your Resend signup email
  subject: "ECG Platform Test Email",
  html: "<h1>Test email working!</h1><p>Email notifications are configured correctly.</p>",
})

if (error) {
  console.error("FAILED:", JSON.stringify(error, null, 2))
} else {
  console.log("SUCCESS:", JSON.stringify(data, null, 2))
}