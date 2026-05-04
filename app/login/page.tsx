// app/login/page.tsx
"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const callbackUrl = searchParams.get("callbackUrl")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email    = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
        setLoading(false)
        return
      }

      // Fetch session to get role
      const res     = await fetch("/api/auth/session")
      const session = await res.json()
      const role    = session?.user?.role

      if (callbackUrl) {
        router.push(callbackUrl)
      } else if (role === "ADMIN") {
        router.push("/admin")
      } else if (role === "DOCTOR") {
        router.push("/doctor")
      } else {
        router.push("/dashboard")
      }

    } catch (err) {
      setError("Something went wrong. Please try again.")
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
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: "#E91E8C" }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: "#9C27B0" }} />

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="p-1 rounded-full mb-6"
            style={{ background: "linear-gradient(135deg, #E91E8C 0%, #9C27B0 30%, #00BCD4 60%, #4CAF50 80%, #FFEB3B 100%)" }}>
            <div className="rounded-full p-3 flex items-center justify-center"
              style={{ backgroundColor: "#111111" }}>
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

        <div className="relative z-10 space-y-4 w-full max-w-xs mt-4">
          {[
            { text: "Upload ECG reports securely",          color: "#E91E8C" },
            { text: "Online payment & instant confirmation", color: "#FFEB3B" },
            { text: "Expert cardiologist interpretation",    color: "#9C27B0" },
            { text: "Receive diagnostic reports digitally",  color: "#4CAF50" },
            { text: "Real-time case tracking",              color: "#00BCD4" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: f.color + "22", border: `1.5px solid ${f.color}` }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={f.color}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-300 text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        {/* ECG animation */}
        <div className="relative z-10 mt-10 w-full max-w-xs opacity-40">
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
              fill="none" stroke="url(#ecgGrad)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
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

          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>

          {registered && (
            <div className="px-4 py-3 rounded-lg mb-4 text-sm font-medium"
              style={{ backgroundColor: "#0a2d1a", color: "#4CAF50", border: "1px solid #4CAF50" }}>
              ✅ Account created! You can now sign in.
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-lg mb-4 text-sm"
              style={{ backgroundColor: "#2d0a0a", color: "#f87171", border: "1px solid #7f1d1d" }}>
              ❌ {error}
            </div>
          )}

          {/* THE FORM — no action, no method attributes */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#00BCD4" }}>
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
              <label className="block text-sm font-medium mb-1" style={{ color: "#00BCD4" }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
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
                  : "linear-gradient(135deg, #E91E8C 0%, #9C27B0 100%)",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="flex gap-1 mt-6 mb-4">
            {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
              <div key={c} className="h-1 flex-1 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            No account yet?{" "}
            <Link href="/register" style={{ color: "#E91E8C" }} className="font-medium hover:underline">
              Register here
            </Link>
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