// app/dashboard/page.tsx
"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cases, setCases] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    reports: 0,
  })
  const [loadingCases, setLoadingCases] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/cases")
        .then((r) => r.json())
        .then((data) => {
          const c = data.cases || []
          setCases(c.slice(0, 5)) // show latest 5
          setStats({
            total: c.length,
            pending: c.filter((x: any) =>
              ["PENDING", "PAID", "ASSIGNED", "IN_REVIEW"].includes(x.status)
            ).length,
            completed: c.filter((x: any) => x.status === "COMPLETED").length,
            reports: c.filter((x: any) => x.case?.interpretation).length,
          })
          setLoadingCases(false)
        })
        .catch(() => setLoadingCases(false))
    }
  }, [status])

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    PENDING:   { label: "Pending Payment",        color: "#FFEB3B", icon: "⏳" },
    PAID:      { label: "Awaiting Assignment",     color: "#00BCD4", icon: "💳" },
    ASSIGNED:  { label: "Assigned to Doctor",      color: "#9C27B0", icon: "👨‍⚕️" },
    IN_REVIEW: { label: "Under Review",            color: "#E91E8C", icon: "🔍" },
    COMPLETED: { label: "Completed",               color: "#4CAF50", icon: "✅" },
  }

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }}
          />
          <p className="text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>

      {/* ── Navbar ── */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-0.5 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)",
            }}
          >
            <div className="rounded-full p-1" style={{ backgroundColor: "#111111" }}>
              <Image
                src="/image/xseve.png"
                alt="Logo"
                width={36}
                height={36}
                className="rounded-full object-contain"
              />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              My ECG<span style={{ color: "#E91E8C" }}>Pediatric</span> Portal
            </p>
            <p className="text-xs" style={{ color: "#00BCD4" }}>
              Patient Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{session?.user?.name}</p>
            <p className="text-gray-400 text-xs">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#E91E8C" }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Color Strip ── */}
      <div className="flex h-1">
        {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Welcome Banner ── */}
        <div
          className="rounded-2xl p-6 mb-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #1e0a14 100%)",
            border: "1px solid #E91E8C33",
          }}
        >
          {/* Background ECG line */}
          <svg
            viewBox="0 0 400 60"
            className="absolute right-0 top-0 h-full opacity-10 hidden sm:block"
            style={{ width: "300px" }}
          >
            <polyline
              points="0,30 50,30 65,8 75,52 85,8 95,52 105,30 160,30 175,4 185,56 195,4 205,56 215,30 400,30"
              fill="none"
              stroke="#E91E8C"
              strokeWidth="2"
            />
          </svg>

          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-1">Good day,</p>
            <h1 className="text-3xl font-bold text-white">
              <span style={{ color: "#E91E8C" }}>
                {session?.user?.name?.split(" ")[0]}
              </span>{" "}
              👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage your ECG submissions and reports from here.
            </p>
            <div className="flex gap-1.5 mt-4">
              {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
                <div
                  key={c}
                  className="h-1 w-8 rounded-full"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Submissions", value: stats.total,     color: "#E91E8C", icon: "📋" },
            { label: "Pending Review",    value: stats.pending,   color: "#FFEB3B", icon: "⏳" },
            { label: "Completed",         value: stats.completed, color: "#4CAF50", icon: "✅" },
            { label: "Reports Ready",     value: stats.reports,   color: "#00BCD4", icon: "📄" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-5 flex flex-col gap-2"
              style={{
                backgroundColor: "#161616",
                border: `1px solid ${stat.color}33`,
              }}
            >
              <span className="text-2xl">{stat.icon}</span>
              <p
                className="text-3xl font-extrabold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-gray-400 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                path: "/dashboard/upload",
                icon: "📤",
                label: "Upload ECG",
                desc: "Submit a new ECG report for interpretation",
                gradient: "linear-gradient(135deg, #E91E8C22, #9C27B022)",
                border: "#E91E8C55",
                iconBg: "#E91E8C22",
              },
              {
                path: "/dashboard/cases",
                icon: "🔍",
                label: "View Cases",
                desc: "Track your ECG case status in real time",
                gradient: "linear-gradient(135deg, #00BCD422, #4CAF5022)",
                border: "#00BCD455",
                iconBg: "#00BCD422",
              },
              {
                path: "/dashboard/reports",
                icon: "📄",
                label: "My Reports",
                desc: "Download completed interpretations",
                gradient: "linear-gradient(135deg, #FFEB3B22, #4CAF5022)",
                border: "#FFEB3B55",
                iconBg: "#FFEB3B22",
              },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="flex items-center gap-4 p-5 rounded-xl text-left transition-all hover:scale-105"
                style={{ background: action.gradient, border: `1px solid ${action.border}` }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: action.iconBg }}
                >
                  {action.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{action.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Cases ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Recent Cases</h2>
            {cases.length > 0 && (
              <button
                onClick={() => router.push("/dashboard/cases")}
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ color: "#00BCD4", border: "1px solid #00BCD433" }}
              >
                View All →
              </button>
            )}
          </div>

          {loadingCases ? (
            <div className="flex justify-center py-12">
              <div
                className="w-10 h-10 rounded-full border-4 animate-spin"
                style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }}
              />
            </div>
          ) : cases.length === 0 ? (
            <div
              className="rounded-xl p-12 flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
            >
              <div className="text-5xl mb-4">🫀</div>
              <p className="text-white font-semibold mb-1">
                No ECG submissions yet
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Upload your first ECG report to get started
              </p>
              <button
                onClick={() => router.push("/dashboard/upload")}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #E91E8C, #9C27B0)",
                }}
              >
                Upload ECG Now
              </button>
              <div className="flex gap-1 mt-8">
                {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
                  <div
                    key={c}
                    className="h-1 w-8 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c: any) => {
                const s = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING
                return (
                  <div
                    key={c.id}
                    className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap cursor-pointer hover:scale-[1.01] transition-all"
                    style={{
                      backgroundColor: "#161616",
                      border: `1px solid ${s.color}33`,
                    }}
                    onClick={() => router.push("/dashboard/cases")}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: s.color + "22" }}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {c.patient?.fullName}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {new Date(c.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          {c.patient?.gender}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {c.payment && (
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor:
                              c.payment.status === "success"
                                ? "#4CAF5022"
                                : "#FFEB3B22",
                            color:
                              c.payment.status === "success"
                                ? "#4CAF50"
                                : "#FFEB3B",
                            border: `1px solid ${
                              c.payment.status === "success"
                                ? "#4CAF5055"
                                : "#FFEB3B55"
                            }`,
                          }}
                        >
                          {c.payment.status === "success" ? "💳 Paid" : "⚠ Unpaid"}
                        </span>
                      )}
                      <span
                        className="text-xs px-3 py-1 rounded-full font-bold"
                        style={{
                          backgroundColor: s.color + "22",
                          color: s.color,
                          border: `1px solid ${s.color}55`,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* View all button */}
              <button
                onClick={() => router.push("/dashboard/cases")}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: "linear-gradient(135deg, #E91E8C11, #9C27B011)",
                  border: "1px solid #E91E8C33",
                  color: "#E91E8C",
                }}
              >
                View All Cases →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}