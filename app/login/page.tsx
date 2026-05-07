// app/login/page.tsx
"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const registered   = searchParams.get("registered")

  const [error, setError]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form     = e.currentTarget
    const email    = (form.elements.namedItem("email")    as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED")) {
          router.push(`/verify-email`)
          return
        }
        setError("Invalid email or password. Please try again.")
        setLoading(false)
        return
      }

      // Get role from session
      const res     = await fetch("/api/auth/session")
      const session = await res.json()
      const role    = session?.user?.role

      if (role === "ADMIN")       router.push("/admin")
      else if (role === "DOCTOR") router.push("/doctor")
      else                        router.push("/dashboard")

    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0a0a0a" }}>

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col items-center justify-center px-16 relative overflow-hidden"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        {/* Background blobs */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ backgroundColor: "#E91E8C" }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ backgroundColor: "#9C27B0" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-5 blur-2xl"
          style={{ backgroundColor: "#00BCD4" }}
        />

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

          {/* Large Logo — circle only, no text */}
          <div
            className="p-1.5 rounded-full mb-8"
            style={{
              background:
                "linear-gradient(135deg, #E91E8C 0%, #9C27B0 25%, #00BCD4 50%, #4CAF50 75%, #FFEB3B 100%)",
              boxShadow: "0 0 80px #E91E8C44",
            }}
          >
            <div
              className="rounded-full p-6 flex items-center justify-center"
              style={{ backgroundColor: "#0d0d0d" }}
            >
              <Image
                src="/image/xseve.png"
                alt="X-Serve Children's Hospital"
                width={180}
                height={180}
                className="object-contain rounded-full"
              />
            </div>
          </div>

          {/* Portal name */}
          <h1 className="text-5xl font-black tracking-tight text-center leading-tight mb-2">
            <span style={{ color: "#E91E8C" }}>My</span>
            <span className="text-white"> ECG</span>
            <br />
            <span style={{ color: "#9C27B0" }}>Pediatric</span>
          </h1>
          <p
            className="text-sm font-bold tracking-[0.3em] uppercase mb-2"
            style={{ color: "#00BCD4" }}
          >
            Portal
          </p>
          <p className="text-gray-600 text-xs text-center mb-10">
            Powered by X-Serve Children's Hospital · Lagos, Nigeria
          </p>

          {/* 5-color bar */}
          <div className="flex gap-2 mb-10 w-full">
            {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
              <div
                key={c}
                className="h-1.5 flex-1 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Feature list */}
          <div className="w-full space-y-4">
            {[
              { icon: "🫀", title: "Expert ECG Interpretation",   desc: "Reviewed by certified pediatric cardiologists",   color: "#E91E8C" },
              { icon: "⚡", title: "Fast Turnaround",              desc: "Standard 48hr · Urgent 6hr response times",       color: "#FFEB3B" },
              { icon: "🔒", title: "Secure & Confidential",        desc: "All records encrypted and HIPAA aware",           color: "#9C27B0" },
              { icon: "📄", title: "Digital Reports",              desc: "Download professional diagnostic reports",         color: "#4CAF50" },
              { icon: "💳", title: "Easy Online Payment",          desc: "Secure payments via Paystack",                    color: "#00BCD4" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    backgroundColor: f.color + "15",
                    border: `1px solid ${f.color}30`,
                  }}
                >
                  {f.icon}
                </div>
                <div className="pt-0.5">
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ECG animation */}
          <div className="mt-10 w-full opacity-20">
            <svg viewBox="0 0 300 40" className="w-full">
              <defs>
                <linearGradient id="ecgLogin" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#E91E8C" />
                  <stop offset="33%"  stopColor="#9C27B0" />
                  <stop offset="66%"  stopColor="#00BCD4" />
                  <stop offset="100%" stopColor="#4CAF50" />
                </linearGradient>
              </defs>
              <polyline
                points="0,20 40,20 50,5 58,35 66,5 74,35 82,20 130,20 140,2 150,38 160,2 170,38 178,20 300,20"
                fill="none"
                stroke="url(#ecgLogin)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div
              className="p-1.5 rounded-full mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)",
                boxShadow: "0 0 40px #E91E8C44",
              }}
            >
              <div
                className="rounded-full p-4"
                style={{ backgroundColor: "#0a0a0a" }}
              >
                <Image
                  src="/image/xseve.png"
                  alt="X-Serve Children's Hospital"
                  width={100}
                  height={100}
                  className="rounded-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-black text-center">
              <span style={{ color: "#E91E8C" }}>My</span>
              <span className="text-white"> ECG</span>
              <span style={{ color: "#9C27B0" }}>Pediatric</span>
            </h1>
            <p
              className="text-xs font-bold tracking-[0.25em] uppercase mt-1"
              style={{ color: "#00BCD4" }}
            >
              Portal
            </p>
            <div className="flex gap-1.5 mt-3">
              {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
                <div
                  key={c}
                  className="h-1 w-8 rounded-full"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: "#111111",
              border: "1px solid #222222",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: "#E91E8C" }}
                />
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#E91E8C" }}
                >
                  Secure Login
                </p>
              </div>
              <h2 className="text-2xl font-black text-white">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to access your ECG portal
              </p>
            </div>

            {/* Success message after registration */}
            {registered && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
                style={{
                  backgroundColor: "#4CAF5011",
                  color: "#4CAF50",
                  border: "1px solid #4CAF5033",
                }}
              >
                <span>✅</span>
                <span>Account created! Please verify your email then sign in.</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
                style={{
                  backgroundColor: "#E91E8C11",
                  color: "#f87171",
                  border: "1px solid #E91E8C33",
                }}
              >
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#00BCD4" }}
                >
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#9C27B0" }}
                  >
                    Password
                  </label>
                  <Link
                    href="/verify-email"
                    className="text-xs hover:underline"
                    style={{ color: "#666" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none pr-16"
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded-lg transition-all"
                    style={{ color: "#666" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-black py-3.5 rounded-xl text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{
                  background: loading
                    ? "#333"
                    : "linear-gradient(135deg, #E91E8C 0%, #9C27B0 60%, #00BCD4 100%)",
                  boxShadow: loading ? "none" : "0 8px 30px #E91E8C33",
                  letterSpacing: "0.05em",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "white",
                        borderTopColor: "transparent",
                      }}
                    />
                    Signing in...
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            {/* Role info */}
            <div
              className="mt-5 p-3 rounded-xl"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
              }}
            >
              <p className="text-xs text-gray-500 text-center mb-2 font-medium">
                Sign in as
              </p>
              <div className="flex justify-center gap-4">
                {[
                  { role: "Patient",  color: "#00BCD4", icon: "🧒" },
                  { role: "Doctor",   color: "#9C27B0", icon: "👨‍⚕️" },
                  { role: "Admin",    color: "#E91E8C", icon: "🛡" },
                ].map((r) => (
                  <div key={r.role} className="flex items-center gap-1.5">
                    <span className="text-sm">{r.icon}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: r.color }}
                    >
                      {r.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "#222" }} />
              <span className="text-gray-600 text-xs">new here?</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#222" }} />
            </div>

            <Link
              href="/register"
              className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #E91E8C44",
                color: "#E91E8C",
              }}
            >
              Create New Account →
            </Link>
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 mt-5">
            {[
              { icon: "🔒", text: "SSL Encrypted"  },
              { icon: "🏥", text: "HIPAA Aware"    },
              { icon: "🛡",  text: "Secure Storage" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5">
                <span className="text-sm">{b.icon}</span>
                <span className="text-xs text-gray-600">{b.text}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-700 text-xs mt-4">
            © 2026 X-Serve Children's Hospital · Lagos, Nigeria
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}