 // app/dashboard/reports/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { ECGUploadWithIncludes } from "@/types/api"

export default function ReportsPage() {
  const { status } = useSession()
  const router     = useRouter()
  const [cases, setCases]     = useState<ECGUploadWithIncludes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    const fetchCases = async () => {
      try {
        const response = await fetch("/api/cases")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const completed = (data.cases || []).filter(
          (c: ECGUploadWithIncludes) => c.status === "COMPLETED" && c.case?.interpretation
        )
        setCases(completed)
      } catch (error) {
        console.error("Failed to fetch cases:", error)
        // Could set an error state here
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [status])

  if (status === "loading") return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>

      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-0.5 rounded-full cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)",
            }}
            onClick={() => router.push("/dashboard")}
          >
            <div className="rounded-full p-1" style={{ backgroundColor: "#111111" }}>
              <Image
                src="/image/xseve.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-full object-contain"
              />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              My ECG<span style={{ color: "#E91E8C" }}>Pediatric</span>
            </p>
            <p className="text-xs" style={{ color: "#4CAF50" }}>
              My Reports
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: "#2a2a2a" }}
          >
            ← Back
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          My <span style={{ color: "#4CAF50" }}>Reports</span>
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Download completed ECG interpretation reports.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div
              className="w-10 h-10 rounded-full border-4 animate-spin"
              style={{ borderColor: "#4CAF50", borderTopColor: "transparent" }}
            />
          </div>
        ) : cases.length === 0 ? (
          <div
            className="rounded-xl p-12 flex flex-col items-center text-center"
            style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
          >
            <div className="text-5xl mb-4">📄</div>
            <p className="text-white font-bold text-lg mb-1">
              No reports yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Completed ECG interpretations will appear here
            </p>
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="px-6 py-2.5 rounded-lg font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #E91E8C, #9C27B0)",
              }}
            >
              Upload ECG Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c: any) => {
              const interp     = c.case?.interpretation
              const riskColors: Record<string, string> = {
                NORMAL:   "#4CAF50",
                LOW:      "#00BCD4",
                MODERATE: "#FFEB3B",
                HIGH:     "#E91E8C",
                CRITICAL: "#ff1744",
              }
              const riskColor = riskColors[interp?.riskLevel] || "#4CAF50"

              return (
                <div
                  key={c.id}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: "#161616",
                    border: `1px solid ${riskColor}33`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-white font-bold">
                        {c.patient?.fullName}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        DOB:{" "}
                        {new Date(c.patient?.dateOfBirth).toLocaleDateString()}
                        {" · "}
                        {c.patient?.gender}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Completed:{" "}
                        {new Date(c.updatedAt || c.createdAt).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </p>

                      {/* Risk level */}
                      <span
                        className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: riskColor + "22",
                          color: riskColor,
                          border: `1px solid ${riskColor}55`,
                        }}
                      >
                        Risk: {interp?.riskLevel || "—"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      {interp?.reportUrl ? (
                        <a
                          href={interp.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #4CAF50, #00BCD4)",
                          }}
                        >
                          📄 Download Report
                        </a>
                      ) : (
                        <span
                          className="text-xs px-3 py-2 rounded-lg font-medium"
                          style={{
                            backgroundColor: "#4CAF5022",
                            color: "#4CAF50",
                            border: "1px solid #4CAF5055",
                          }}
                        >
                          ✅ Interpretation Complete
                        </span>
                      )}
                      <button
                        onClick={() => router.push("/dashboard/cases")}
                        className="text-xs"
                        style={{ color: "#00BCD4" }}
                      >
                        View case details →
                      </button>
                    </div>
                  </div>

                  {/* Conclusion preview */}
                  {interp?.conclusion && (
                    <div
                      className="mt-4 p-3 rounded-lg"
                      style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                      }}
                    >
                      <p
                        className="text-xs font-bold mb-1 uppercase tracking-wider"
                        style={{ color: "#9C27B0" }}
                      >
                        Conclusion
                      </p>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {interp.conclusion}
                      </p>
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
