// app/register/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword]  = useState(false)
  const [showConfirm, setShowConfirm]    = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  function checkStrength(val: string) {
    let score = 0
    if (val.length >= 8)                    score++
    if (/[A-Z]/.test(val))                  score++
    if (/[0-9]/.test(val))                  score++
    if (/[^A-Za-z0-9]/.test(val))          score++
    setPasswordStrength(score)
  }

  const strengthConfig = [
    { label: "Weak",      color: "#E91E8C" },
    { label: "Fair",      color: "#FFEB3B" },
    { label: "Good",      color: "#00BCD4" },
    { label: "Strong",    color: "#4CAF50" },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    setError("")

    const form     = e.currentTarget
    const name     = (form.elements.namedItem("name")     as HTMLInputElement).value
    const email    = (form.elements.namedItem("email")    as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const confirm  = (form.elements.namedItem("confirm")  as HTMLInputElement).value

    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, role: "PATIENT" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      router.push("/verify-email")

    } catch (err) {
      console.error("Register fetch error:", err)
      setError("Network error. Please check your connection.")
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
        {/* Animated background blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ backgroundColor: "#9C27B0" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ backgroundColor: "#E91E8C" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 blur-2xl"
          style={{ backgroundColor: "#00BCD4" }}
        />

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

          {/* Large Logo */}
          <div
            className="p-1.5 rounded-full mb-8"
            style={{
              background:
                "linear-gradient(135deg, #E91E8C 0%, #9C27B0 25%, #00BCD4 50%, #4CAF50 75%, #FFEB3B 100%)",
              boxShadow: "0 0 60px #E91E8C33",
            }}
          >
            <div
              className="rounded-full p-5 flex items-center justify-center"
              style={{ backgroundColor: "#0d0d0d" }}
            >
              <Image
                src="/image/xseve.png"
                alt="X-Serve Children's Hospital"
                width={160}
                height={160}
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
            className="text-sm font-bold tracking-[0.3em] uppercase mb-1"
            style={{ color: "#00BCD4" }}
          >
            Portal
          </p>
          <p className="text-gray-500 text-xs text-center mb-8">
            Powered by X-Serve Children's Hospital · Lagos, Nigeria
          </p>

          {/* 5-color bar */}
          <div className="flex gap-2 mb-10 w-full justify-center">
            {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
              <div
                key={c}
                className="h-1.5 flex-1 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* How it works */}
          <div className="w-full">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "#666" }}
            >
              How it works
            </p>
            <div className="space-y-4">
              {[
                { step: "01", title: "Create Account",          desc: "Register and verify your email",          color: "#E91E8C" },
                { step: "02", title: "Upload ECG Report",        desc: "Securely upload your child's ECG file",   color: "#9C27B0" },
                { step: "03", title: "Complete Payment",         desc: "Pay securely via Paystack",               color: "#FFEB3B" },
                { step: "04", title: "Expert Interpretation",    desc: "Pediatric cardiologist reviews your ECG", color: "#4CAF50" },
                { step: "05", title: "Download Your Report",     desc: "Receive a full diagnostic report",        color: "#00BCD4" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs"
                    style={{
                      backgroundColor: s.color + "15",
                      border:          `1px solid ${s.color}40`,
                      color:           s.color,
                    }}
                  >
                    {s.step}
                  </div>
                  <div className="pt-1">
                    <p className="text-white font-semibold text-sm">{s.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ECG line */}
          <div className="mt-10 w-full opacity-20">
            <svg viewBox="0 0 300 40" className="w-full">
              <defs>
                <linearGradient id="ecgG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#E91E8C" />
                  <stop offset="50%"  stopColor="#9C27B0" />
                  <stop offset="100%" stopColor="#00BCD4" />
                </linearGradient>
              </defs>
              <polyline
                points="0,20 40,20 50,5 58,35 66,5 74,35 82,20 130,20 140,2 150,38 160,2 170,38 178,20 300,20"
                fill="none"
                stroke="url(#ecgG)"
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
              className="p-1 rounded-full mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)",
                boxShadow: "0 0 30px #E91E8C44",
              }}
            >
              <div
                className="rounded-full p-3"
                style={{ backgroundColor: "#0a0a0a" }}
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="rounded-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-black text-center">
              <span style={{ color: "#E91E8C" }}>My</span>
              <span className="text-white"> ECG</span>
              <span style={{ color: "#9C27B0" }}>Pediatric</span>
            </h1>
            <p className="text-xs font-bold tracking-widest uppercase mt-1 mb-1"
              style={{ color: "#00BCD4" }}>Portal</p>
            <div className="flex gap-1 mt-2">
              {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
                <div key={c} className="h-1 w-8 rounded-full" style={{ backgroundColor: c }} />
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
                <p className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#E91E8C" }}>
                  New Account
                </p>
              </div>
              <h2 className="text-2xl font-black text-white">
                Create Your Account
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Join thousands of families accessing expert pediatric ECG interpretation
              </p>
            </div>

            {/* Notice */}
            <div
              className="flex items-start gap-3 p-3 rounded-xl mb-5"
              style={{
                backgroundColor: "#00BCD411",
                border: "1px solid #00BCD422",
              }}
            >
              <span className="text-lg flex-shrink-0">👤</span>
              <p className="text-xs leading-relaxed" style={{ color: "#00BCD4" }}>
                <strong>Patients & Parents</strong> register here.
                Doctors and medical staff should contact the hospital admin for access.
              </p>
            </div>

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

              {/* Full Name */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#E91E8C" }}
                >
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Amaka Okafor"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#9C27B0" }}
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
                <p className="text-xs text-gray-600 mt-1 ml-1">
                  📧 A verification email will be sent to this address
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#00BCD4" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    onChange={(e) => checkStrength(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none pr-12"
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password strength */}
                {passwordStrength > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{
                            backgroundColor:
                              i <= passwordStrength
                                ? strengthConfig[passwordStrength - 1]?.color
                                : "#2a2a2a",
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-xs mt-1 ml-1"
                      style={{
                        color: strengthConfig[passwordStrength - 1]?.color,
                      }}
                    >
                      {strengthConfig[passwordStrength - 1]?.label} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#4CAF50" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    minLength={8}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none pr-12"
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-0.5 flex-shrink-0"
                  style={{ accentColor: "#E91E8C" }}
                />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{" "}
                  <span style={{ color: "#E91E8C" }} className="cursor-pointer hover:underline">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span style={{ color: "#9C27B0" }} className="cursor-pointer hover:underline">
                    Privacy Policy
                  </span>
                  . I understand this platform is for pediatric ECG interpretation only.
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-black py-3.5 rounded-xl text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      style={{ borderColor: "white", borderTopColor: "transparent" }}
                    />
                    Creating account...
                  </span>
                ) : (
                  "Create Account & Verify Email →"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: "#222" }} />
              <span className="text-gray-600 text-xs">or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#222" }} />
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold hover:underline"
                style={{ color: "#E91E8C" }}
              >
                Sign In →
              </Link>
            </p>
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 mt-5">
            {[
              { icon: "🔒", text: "SSL Encrypted" },
              { icon: "🏥", text: "HIPAA Aware"  },
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