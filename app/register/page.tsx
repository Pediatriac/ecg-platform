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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "PATIENT" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")

    } catch (err) {
      console.error("Register fetch error:", err)
      setError("Network error. Please check your connection.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0a0a0a" }}>

      {/* Left Panel */}
      <div
        className="hidden lg:flex w-1/2 flex-col items-center justify-center px-12 relative overflow-hidden"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: "#9C27B0" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: "#E91E8C" }} />

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="p-1 rounded-full mb-6"
            style={{ background: "linear-gradient(135deg, #FFEB3B 0%, #E91E8C 25%, #9C27B0 50%, #00BCD4 75%, #4CAF50 100%)" }}>
            <div className="rounded-full p-3" style={{ backgroundColor: "#111111" }}>
              <Image src="/image/xseve.png" alt="X-Serve Children's Hospital"
                width={130} height={130} className="object-contain rounded-full" />
            </div>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-center">
            <span style={{ color: "#E91E8C" }}>My</span>
            <span className="text-white"> ECG</span>
            <span style={{ color: "#9C27B0" }}>Pediatric</span>
          </h2>
          <p className="text-xs font-bold tracking-widest uppercase mt-2"
            style={{ color: "#00BCD4" }}>Portal</p>

          <div className="flex gap-1.5 mt-5">
            {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
              <div key={c} className="h-1.5 w-10 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="relative z-10 w-full max-w-xs space-y-3">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-4">
            How it works
          </p>
          {[
            { step: "1", text: "Create your account",          color: "#E91E8C" },
            { step: "2", text: "Upload your child's ECG",      color: "#9C27B0" },
            { step: "3", text: "Make a secure payment",        color: "#FFEB3B" },
            { step: "4", text: "Receive expert interpretation", color: "#4CAF50" },
            { step: "5", text: "Download your report",         color: "#00BCD4" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                style={{
                  backgroundColor: s.color + "22",
                  border: `1.5px solid ${s.color}`,
                  color: s.color,
                }}>
                {s.step}
              </div>
              <span className="text-gray-300 text-sm">{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
          style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-6">
            <div className="p-1 rounded-full mb-3"
              style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)" }}>
              <div className="rounded-full p-2" style={{ backgroundColor: "#161616" }}>
                <Image src="/image/xseve.png" alt="Logo" width={70} height={70}
                  className="rounded-full object-contain" />
              </div>
            </div>
            <p className="text-white font-bold text-lg">
              My ECG<span style={{ color: "#E91E8C" }}>Pediatric</span> Portal
            </p>
            <div className="flex gap-1 mt-2">
              {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
                <div key={c} className="h-1 w-6 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-gray-400 text-sm mb-6">Join My ECGPediatric Portal today</p>

          {error && (
            <div className="px-4 py-3 rounded-lg mb-4 text-sm"
              style={{ backgroundColor: "#2d0a0a", color: "#f87171", border: "1px solid #7f1d1d" }}>
              ❌ {error}
            </div>
          )}

          {/* NO action, NO method on the form tag */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: "#E91E8C" }}>
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="e.g. Amaka Okafor"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: "#9C27B0" }}>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: "#00BCD4" }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                minLength={8}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: "#4CAF50" }}>
                Confirm Password
              </label>
              <input
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
                minLength={8}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-lg text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading
                  ? "#555"
                  : "linear-gradient(135deg, #E91E8C 0%, #9C27B0 50%, #00BCD4 100%)",
              }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div className="flex gap-1 mt-6 mb-4">
            {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
              <div key={c} className="h-1 flex-1 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#E91E8C" }}
              className="font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}