"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function ProfileClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  })
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
  }, [status, router, callbackUrl])

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }))
    }
  }, [session])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/cases")
      .then((r) => r.json())
      .then((data) => {
        const cases = data.cases || []
        setStats({
          total: cases.length,
          completed: cases.filter((c: any) => c.status === "COMPLETED").length,
          pending: cases.filter((c: any) =>
            ["PENDING", "PAID", "ASSIGNED", "IN_REVIEW"].includes(c.status)
          ).length,
        })
      })
      .catch(() => {})
  }, [status])

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match")
      setLoading(false)
      return
    }

    if (form.newPassword && form.newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Update failed")
      } else {
        setSuccess("Profile updated successfully!")
        setForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      }
    } catch {
      setError("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }} />
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") return null

  const roleColors: Record<string, string> = {
    ADMIN: "#E91E8C",
    DOCTOR: "#9C27B0",
    PATIENT: "#00BCD4",
  }
  const roleColor = roleColors[session?.user?.role || "PATIENT"] || "#00BCD4"

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}>
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-full cursor-pointer" style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)" }} onClick={() => router.push("/dashboard") }>
            <div className="rounded-full p-1" style={{ backgroundColor: "#111111" }}>
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-full object-contain" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              My ECG<span style={{ color: "#E91E8C" }}>Pediatric</span> Portal
            </p>
            <p className="text-xs" style={{ color: "#00BCD4" }}>
              My Profile
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard")} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#2a2a2a" }}>
            ← Back
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E91E8C" }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="flex h-1">
        {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">
          My <span style={{ color: "#E91E8C" }}>Profile</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="rounded-xl p-6 flex flex-col items-center text-center" style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
              <div className="p-0.5 rounded-full mb-4" style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)" }}>
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-extrabold" style={{ backgroundColor: "#161616", color: roleColor }}>
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="text-white font-bold text-lg">{session?.user?.name}</p>
              <p className="text-gray-400 text-sm mt-0.5">{session?.user?.email}</p>
              <span className="mt-3 text-xs font-bold px-4 py-1.5 rounded-full" style={{ backgroundColor: roleColor + "22", color: roleColor, border: `1px solid ${roleColor}55` }}>
                {session?.user?.role}
              </span>
              <div className="flex gap-1 mt-5">
                {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
                  <div key={c} className="h-1 w-6 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#00BCD4" }}>My Activity</p>
              <div className="space-y-3">
                {[
                  { label: "Total Cases", value: stats.total, color: "#E91E8C" },
                  { label: "Completed", value: stats.completed, color: "#4CAF50" },
                  { label: "In Progress", value: stats.pending, color: "#FFEB3B" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "#1a1a1a", border: `1px solid ${s.color}22` }}>
                    <span className="text-gray-400 text-sm">{s.label}</span>
                    <span className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/dashboard/cases")} className="w-full mt-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
                View All Cases →
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl p-6" style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
              <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><span style={{ color: "#9C27B0" }}>✏️</span> Edit Profile</h2>
              {success && (
                <div className="px-4 py-3 rounded-lg mb-4 text-sm font-medium" style={{ backgroundColor: "#0a2d1a", color: "#4CAF50", border: "1px solid #4CAF50" }}>
                  ✅ {success}
                </div>
              )}
              {error && (
                <div className="px-4 py-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: "#2d0a0a", color: "#f87171", border: "1px solid #7f1d1d" }}>
                  ❌ {error}
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#E91E8C" }}>Account Information</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#E91E8C" }}>Full Name</label>
                      <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none" style={{ backgroundColor: "#222222", border: "1px solid #333333" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#9C27B0" }}>Email Address</label>
                      <input type="email" value={form.email} disabled className="w-full rounded-lg px-4 py-2.5 text-sm cursor-not-allowed" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: "#666" }} />
                      <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#00BCD4" }}>Role</label>
                      <input type="text" value={session?.user?.role || ""} disabled className="w-full rounded-lg px-4 py-2.5 text-sm cursor-not-allowed" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", color: roleColor }} />
                    </div>
                  </div>
                </div>

                <div className="h-px" style={{ backgroundColor: "#2a2a2a" }} />

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FFEB3B" }}>
                    Change Password <span className="text-gray-600 normal-case font-normal">(leave blank to keep current)</span>
                  </p>
                  <div className="space-y-3">
                    {[
                      { key: "currentPassword", label: "Current Password", color: "#FFEB3B", placeholder: "Enter current password" },
                      { key: "newPassword", label: "New Password", color: "#4CAF50", placeholder: "Minimum 8 characters" },
                      { key: "confirmPassword", label: "Confirm New Password", color: "#4CAF50", placeholder: "Repeat new password" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium mb-1" style={{ color: f.color }}>{f.label}</label>
                        <input type="password" value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none" style={{ backgroundColor: "#222222", border: "1px solid #333333" }} />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: loading ? "#555" : "linear-gradient(135deg, #E91E8C 0%, #9C27B0 50%, #00BCD4 100%)" }}>
                  {loading ? "Saving..." : "Save Changes →"}
                </button>
              </form>
            </div>

            <div className="rounded-xl p-5" style={{ backgroundColor: "#161616", border: "1px solid #E91E8C22" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#E91E8C" }}>Account Actions</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push("/dashboard/upload")} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
                  📤 Upload ECG
                </button>
                <button onClick={() => router.push("/dashboard/cases")} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #00BCD4, #4CAF50)" }}>
                  🔍 View Cases
                </button>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: "#2a2a2a", color: "#E91E8C", border: "1px solid #E91E8C33" }}>
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
