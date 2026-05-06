 // app/verify-email/page.tsx
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import Image from "next/image"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const success = searchParams.get("success")
  const error   = searchParams.get("error")

  const [email, setEmail]       = useState("")
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [sendError, setSendError] = useState("")

  async function handleResend() {
    if (!email) {
      setSendError("Please enter your email address")
      return
    }
    setSending(true)
    setSendError("")

    const res  = await fetch("/api/auth/resend-verification", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    })
    const data = await res.json()

    if (res.ok) {
      setSent(true)
    } else {
      setSendError(data.error || "Failed to send email")
    }
    setSending(false)
  }

  const config = success
    ? {
        icon:  "✅",
        color: "#4CAF50",
        title: "Email Verified!",
        desc:  "Your account has been verified successfully. You can now sign in.",
      }
    : error === "expired"
    ? {
        icon:  "⏰",
        color: "#FFEB3B",
        title: "Link Expired",
        desc:  "Your verification link has expired. Request a new one below.",
      }
    : error === "invalid"
    ? {
        icon:  "❌",
        color: "#E91E8C",
        title: "Invalid Link",
        desc:  "This verification link is invalid. Request a new one below.",
      }
    : {
        icon:  "📧",
        color: "#00BCD4",
        title: "Check Your Email",
        desc:  "We sent a verification link to your email. Click it to activate your account.",
      }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          backgroundColor: "#161616",
          border: `1px solid ${config.color}33`,
        }}
      >
        {/* Logo */}
        <div
          className="inline-block p-0.5 rounded-full mb-6"
          style={{
            background:
              "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)",
          }}
        >
          <div className="rounded-full p-2" style={{ backgroundColor: "#161616" }}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-full object-contain"
            />
          </div>
        </div>

        <div className="text-5xl mb-4">{config.icon}</div>

        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: config.color }}
        >
          {config.title}
        </h1>

        <p className="text-gray-400 text-sm mb-6">{config.desc}</p>

        {/* Color strip */}
        <div className="flex gap-1 mb-6">
          {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
            <div
              key={c}
              className="h-1 flex-1 rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Success state */}
        {success && (
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #4CAF50, #00BCD4)",
            }}
          >
            Sign In Now →
          </button>
        )}

        {/* Error or default — show resend form */}
        {!success && (
          <div className="space-y-3">
            {sent ? (
              <div
                className="px-4 py-3 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "#0a2d1a",
                  color: "#4CAF50",
                  border: "1px solid #4CAF50",
                }}
              >
                ✅ Verification email sent! Check your inbox.
              </div>
            ) : (
              <>
                <p
                  className="text-xs text-left font-medium mb-1"
                  style={{ color: "#00BCD4" }}
                >
                  Enter your email to resend verification:
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                  style={{
                    backgroundColor: "#222222",
                    border: "1px solid #333333",
                  }}
                />

                {sendError && (
                  <p className="text-xs" style={{ color: "#f87171" }}>
                    ❌ {sendError}
                  </p>
                )}

                <button
                  onClick={handleResend}
                  disabled={sending}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                  style={{
                    background: sending
                      ? "#555"
                      : "linear-gradient(135deg, #E91E8C, #9C27B0)",
                  }}
                >
                  {sending ? "Sending..." : "Resend Verification Email"}
                </button>
              </>
            )}

            <button
              onClick={() => router.push("/login")}
              className="w-full py-2 rounded-xl text-sm"
              style={{ color: "#666" }}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
