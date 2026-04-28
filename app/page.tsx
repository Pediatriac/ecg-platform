// app/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (status === "authenticated") {
      const role = session?.user?.role
      if (role === "ADMIN")       router.push("/admin")
      else if (role === "DOCTOR") router.push("/doctor")
      else                        router.push("/dashboard")
    }
  }, [status, session, router])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: "#E91E8C" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: "#9C27B0" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5 blur-2xl"
        style={{ backgroundColor: "#00BCD4" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Logo */}
        <div
          className="p-1 rounded-full mb-8"
          style={{
            background:
              "linear-gradient(135deg, #E91E8C 0%, #9C27B0 25%, #00BCD4 50%, #4CAF50 75%, #FFEB3B 100%)",
          }}
        >
          <div className="rounded-full p-4" style={{ backgroundColor: "#0a0a0a" }}>
            <Image
              src="/image/xseve.png"
              alt="X-Serve Children's Hospital"
              width={120}
              height={120}
              className="object-contain rounded-full"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold mb-3">
          <span style={{ color: "#E91E8C" }}>My</span>
          <span className="text-white"> ECG</span>
          <span style={{ color: "#9C27B0" }}>Pediatric</span>
        </h1>
        <p
          className="text-sm font-bold tracking-widest uppercase mb-2"
          style={{ color: "#00BCD4" }}
        >
          Portal
        </p>
        <p className="text-gray-400 text-sm mb-2">
          Powered by X-Serve Children's Hospital
        </p>

        {/* Color bar */}
        <div className="flex gap-1.5 mb-10">
          {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
            <div
              key={c}
              className="h-1.5 w-10 rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-base max-w-md mb-10 leading-relaxed">
          Secure pediatric ECG interpretation platform. Upload reports, pay
          online, and receive expert cardiologist interpretations — fast.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button
            onClick={() => router.push("/login")}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #E91E8C, #9C27B0)",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/register")}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              backgroundColor: "transparent",
              border: "2px solid #E91E8C",
              color: "#E91E8C",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl w-full">
          {[
            { icon: "📤", label: "Upload ECG",       desc: "Secure file upload",            color: "#E91E8C" },
            { icon: "💳", label: "Pay Online",        desc: "Paystack integration",          color: "#FFEB3B" },
            { icon: "📄", label: "Get Report",        desc: "Expert interpretation",         color: "#4CAF50" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: "#161616",
                border: `1px solid ${f.color}33`,
              }}
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="text-white font-bold text-sm">{f.label}</p>
              <p className="text-gray-400 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ECG line */}
        <div className="mt-12 w-full max-w-md opacity-30">
          <svg viewBox="0 0 300 50" className="w-full">
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#E91E8C" />
                <stop offset="25%"  stopColor="#9C27B0" />
                <stop offset="50%"  stopColor="#00BCD4" />
                <stop offset="75%"  stopColor="#4CAF50" />
                <stop offset="100%" stopColor="#FFEB3B" />
              </linearGradient>
            </defs>
            <polyline
              points="0,25 40,25 50,8 58,42 66,8 74,42 82,25 130,25 140,4 150,46 160,4 170,46 178,25 300,25"
              fill="none"
              stroke="url(#ecgGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-gray-600 text-xs mt-6">
          © 2026 X-Serve Children's Hospital · Lagos, Nigeria
        </p>
      </div>
    </div>
  )
}