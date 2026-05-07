// app/dashboard/cases/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signOut } from "next-auth/react"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:   { label: "Pending Payment",       color: "#FFEB3B", icon: "⏳" },
  PAID:      { label: "Awaiting Assignment",    color: "#00BCD4", icon: "💳" },
  ASSIGNED:  { label: "Assigned to Doctor",     color: "#9C27B0", icon: "👨‍⚕️" },
  IN_REVIEW: { label: "Under Review",           color: "#E91E8C", icon: "🔍" },
  COMPLETED: { label: "Completed",              color: "#4CAF50", icon: "✅" },
}

const STATUS_ORDER = ["PENDING", "PAID", "ASSIGNED", "IN_REVIEW", "COMPLETED"]
const STEP_LABELS  = ["Submitted", "Paid", "Assigned", "In Review", "Complete"]
const STEP_COLORS  = ["#FFEB3B", "#00BCD4", "#9C27B0", "#E91E8C", "#4CAF50"]

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/cases")
      .then((r) => r.json())
      .then((data) => {
        setCases(data.cases || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>

      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-0.5 rounded-full cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)",
            }}
            onClick={() => router.push("/dashboard")}
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
            <p className="text-xs" style={{ color: "#00BCD4" }}>My Cases</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#2a2a2a" }}
          >
            ← Back
          </button>
          <button
            onClick={() => router.push("/dashboard/upload")}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}
          >
            + New Upload
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#E91E8C" }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Color strip */}
      <div className="flex h-1">
        {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          My <span style={{ color: "#00BCD4" }}>ECG Cases</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Track the status of all your submitted ECG reports.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-12 h-12 rounded-full border-4 animate-spin"
              style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }}
            />
          </div>
        ) : cases.length === 0 ? (
          <div
            className="rounded-xl p-16 flex flex-col items-center text-center"
            style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
          >
            <div className="text-5xl mb-4">🫀</div>
            <p className="text-white font-bold text-lg mb-1">No cases yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Submit your first ECG to get started
            </p>
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="px-6 py-2.5 rounded-lg font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}
            >
              Upload ECG Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c: any) => {
              const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING
              const currentIdx = STATUS_ORDER.indexOf(c.status)
              const progressPct = ((currentIdx + 1) / STATUS_ORDER.length) * 100

              return (
                <div
                  key={c.id}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: "#161616",
                    border: `1px solid ${statusCfg.color}33`,
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: statusCfg.color + "22" }}
                      >
                        {statusCfg.icon}
                      </div>
                      <div>
                        <p className="text-white font-bold">
                          {c.patient?.fullName}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          DOB: {new Date(c.patient?.dateOfBirth).toLocaleDateString()}
                          {" · "}
                          {c.patient?.gender}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Submitted:{" "}
                          {new Date(c.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right side badges */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: statusCfg.color + "22",
                          color: statusCfg.color,
                          border: `1px solid ${statusCfg.color}55`,
                        }}
                      >
                        {statusCfg.icon} {statusCfg.label}
                      </span>

                      {c.payment && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              c.payment.status === "success" ? "#4CAF5022" : "#FFEB3B22",
                            color:
                              c.payment.status === "success" ? "#4CAF50" : "#FFEB3B",
                            border: `1px solid ${
                              c.payment.status === "success" ? "#4CAF5055" : "#FFEB3B55"
                            }`,
                          }}
                        >
                          ₦{(c.payment.amount / 100).toLocaleString()} ·{" "}
                          {c.payment.status === "success" ? "Paid" : "Unpaid"}
                        </span>
                      )}
                      {c.status === "PAID" && !c.case?.doctor && (
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: "#9C27B022",
                            color: "#9C27B0",
                            border: "1px solid #9C27B033",
                          }}
                        >
                          Waiting for doctor assignment
                        </span>
                      )}

                      {c.status === "ASSIGNED" && c.case?.doctor && (
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: "#9C27B022",
                            color: "#9C27B0",
                            border: "1px solid #9C27B033",
                          }}
                        >
                          Assigned to Dr. {c.case.doctor.name}
                        </span>
                      )}
                      {/* Download report button — only when completed */}
                      {c.case?.interpretation && c.case.interpretation.reportUrl && (
                        <a
                          href={c.case.interpretation.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold px-3 py-1 rounded-lg text-white"
                          style={{
                            background: "linear-gradient(135deg, #4CAF50, #00BCD4)",
                          }}
                        >
                          📄 Download Report
                        </a>
                      )}

                      {/* Completed but no report URL yet */}
                      {c.case?.interpretation && !c.case.interpretation.reportUrl && (
                        <span
                          className="text-xs px-3 py-1 rounded-lg font-medium"
                          style={{
                            backgroundColor: "#4CAF5022",
                            color: "#4CAF50",
                            border: "1px solid #4CAF5055",
                          }}
                        >
                          ✅ Interpretation Ready
                        </span>
                      )}

                      {/* Retry payment if still pending */}
                      {c.status === "PENDING" && c.payment && (
                        <button
                          onClick={async () => {
                            const res = await fetch("/api/payment/retry", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                reference: c.payment.reference,
                              }),
                            })
                            const data = await res.json()
                            if (data.paymentUrl) {
                              window.location.href = data.paymentUrl
                            }
                          }}
                          className="text-xs font-bold px-3 py-1 rounded-lg"
                          style={{
                            backgroundColor: "#FFEB3B22",
                            color: "#FFEB3B",
                            border: "1px solid #FFEB3B55",
                          }}
                        >
                          💳 Complete Payment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-5">
                    <div className="flex justify-between text-xs mb-2">
                      {STEP_LABELS.map((label, i) => (
                        <span
                          key={label}
                          style={{
                            color: i <= currentIdx ? STEP_COLORS[i] : "#444",
                            fontWeight: i === currentIdx ? "bold" : "normal",
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#2a2a2a" }}
                    >
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          background:
                            "linear-gradient(90deg, #FFEB3B, #00BCD4, #9C27B0, #E91E8C, #4CAF50)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Symptoms if present */}
                  {c.patient?.symptoms && (
                    <div
                      className="mt-3 px-3 py-2 rounded-lg text-xs"
                      style={{
                        backgroundColor: "#9C27B011",
                        color: "#9C27B0",
                        border: "1px solid #9C27B033",
                      }}
                    >
                      ⚕ <span className="font-medium">Symptoms:</span>{" "}
                      {c.patient.symptoms}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}