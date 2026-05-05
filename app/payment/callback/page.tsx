 // app/payment/callback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Image from "next/image"

function CallbackContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const reference    = searchParams.get("reference")
  const trxref       = searchParams.get("trxref")

  const [status, setStatus]   = useState<"verifying" | "success" | "failed">("verifying")
  const [message, setMessage] = useState("Verifying your payment...")

  useEffect(() => {
    const ref = reference || trxref
    if (!ref) {
      setStatus("failed")
      setMessage("No payment reference found.")
      return
    }

    verifyPayment(ref)
  }, [reference, trxref])

  async function verifyPayment(ref: string) {
    try {
      const res  = await fetch(`/api/payment/verify?reference=${ref}`)
      const data = await res.json()

      if (res.ok && data.success) {
        setStatus("success")
        setMessage("Payment confirmed! Your ECG case is now queued for interpretation.")
        setTimeout(() => router.push("/dashboard/cases"), 3000)
      } else {
        setStatus("failed")
        setMessage(data.error || "Payment verification failed.")
      }
    } catch (err) {
      setStatus("failed")
      setMessage("Something went wrong. Please contact support.")
    }
  }

  const config = {
    verifying: {
      icon:  "⏳",
      color: "#FFEB3B",
      title: "Verifying Payment...",
    },
    success: {
      icon:  "✅",
      color: "#4CAF50",
      title: "Payment Successful!",
    },
    failed: {
      icon:  "❌",
      color: "#E91E8C",
      title: "Payment Failed",
    },
  }[status]

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{ backgroundColor: "#161616", border: `1px solid ${config.color}33` }}
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
              src="/image/xseve.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-full object-contain"
            />
          </div>
        </div>

        {/* Status icon */}
        <div className="text-6xl mb-4">
          {status === "verifying" ? (
            <div
              className="w-16 h-16 rounded-full border-4 animate-spin mx-auto"
              style={{
                borderColor: config.color,
                borderTopColor: "transparent",
              }}
            />
          ) : (
            config.icon
          )}
        </div>

        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: config.color }}
        >
          {config.title}
        </h1>

        <p className="text-gray-400 text-sm mb-6">{message}</p>

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

        {status === "success" && (
          <div>
            <p className="text-gray-500 text-xs mb-4">
              Redirecting to your cases in 3 seconds...
            </p>
            <button
              onClick={() => router.push("/dashboard/cases")}
              className="w-full py-3 rounded-xl font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #4CAF50, #00BCD4)",
              }}
            >
              View My Cases →
            </button>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="w-full py-3 rounded-xl font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #E91E8C, #9C27B0)",
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{
                backgroundColor: "#2a2a2a",
                color: "#666",
              }}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
}
