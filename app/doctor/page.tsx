 // app/doctor/page.tsx
"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  URGENT:   { label: "Urgent",   color: "#E91E8C" },
  STANDARD: { label: "Standard", color: "#00BCD4" },
}

const RISK_LEVELS = [
  { value: "NORMAL",   label: "Normal",          color: "#4CAF50" },
  { value: "LOW",      label: "Low Risk",         color: "#00BCD4" },
  { value: "MODERATE", label: "Moderate Risk",    color: "#FFEB3B" },
  { value: "HIGH",     label: "High Risk",        color: "#E91E8C" },
  { value: "CRITICAL", label: "Critical — Urgent",color: "#ff1744" },
]

export default function DoctorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [cases, setCases]               = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [submitting, setSubmitting]     = useState(false)
  const [resendingId, setResendingId]   = useState<string | null>(null)
  const [success, setSuccess]           = useState("")
  const [error, setError]               = useState("")
  const [activeTab, setActiveTab]       = useState<"queue" | "completed">("queue")

  const [form, setForm] = useState({
    rhythm: "",
    rate: "",
    axis: "",
    intervals: "",
    findings: "",
    conclusion: "",
    riskLevel: "NORMAL",
    recommendations: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && session?.user?.role !== "DOCTOR") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated") fetchCases()
  }, [status])

  async function fetchCases() {
    setLoading(true)
    const res = await fetch("/api/doctor/cases")
    const data = await res.json()
    setCases(data.cases || [])
    setLoading(false)
  }

  async function handleAssign(caseId: string) {
    await fetch("/api/doctor/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId }),
    })
    fetchCases()
  }

  async function handleSubmitInterpretation(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCase) return
    setSubmitting(true)
    setError("")

    const res = await fetch("/api/doctor/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: selectedCase.id,
        ...form,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Failed to submit")
      setSubmitting(false)
      return
    }

    setSuccess("Interpretation submitted successfully!")
    setSelectedCase(null)
    setForm({
      rhythm: "", rate: "", axis: "", intervals: "",
      findings: "", conclusion: "", riskLevel: "NORMAL", recommendations: "",
    })
    fetchCases()
    setSubmitting(false)
    setTimeout(() => setSuccess(""), 4000)
  }

  async function handleResendReport(caseId: string) {
    setResendingId(caseId)
    setError("")
    setSuccess("")

    const res = await fetch("/api/doctor/resend-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Failed to resend report")
      setResendingId(null)
      return
    }

    setSuccess("Report notification resent to patient.")
    setResendingId(null)
    setTimeout(() => setSuccess(""), 4000)
  }

  const pendingCases   = cases.filter((c) => !c.interpretation)
  const completedCases = cases.filter((c) => c.interpretation)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}>
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)" }}>
            <div className="rounded-full p-1" style={{ backgroundColor: "#111111" }}>
              <Image src="/Xseve.png" alt="Logo" width={36} height={36} className="rounded-full object-contain" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              My ECG<span style={{ color: "#E91E8C" }}>Pediatric</span> Portal
            </p>
            <p className="text-xs" style={{ color: "#9C27B0" }}>Doctor Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs" style={{ color: "#9C27B0" }}>Pediatric Cardiologist</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#E91E8C" }}>
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

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Welcome + Stats ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Dr. <span style={{ color: "#9C27B0" }}>
                {session?.user?.name?.split(" ").slice(-1)[0]}
              </span> 👨‍⚕️
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Pediatric Cardiologist — ECG Interpretation Queue
            </p>
          </div>

          <div className="flex gap-3">
            {[
              { label: "Pending",   value: pendingCases.length,   color: "#FFEB3B" },
              { label: "Completed", value: completedCases.length, color: "#4CAF50" },
              { label: "Total",     value: cases.length,          color: "#00BCD4" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3 text-center min-w-[70px]"
                style={{ backgroundColor: "#161616", border: `1px solid ${s.color}33` }}>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-gray-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="px-4 py-3 rounded-lg mb-4 text-sm font-medium"
            style={{ backgroundColor: "#0a2d1a", color: "#4CAF50", border: "1px solid #4CAF50" }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-lg mb-4 text-sm"
            style={{ backgroundColor: "#2d0a0a", color: "#f87171", border: "1px solid #7f1d1d" }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Case Queue ── */}
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { key: "queue",     label: `Pending (${pendingCases.length})`,     color: "#FFEB3B" },
                { key: "completed", label: `Completed (${completedCases.length})`, color: "#4CAF50" },
              ].map((tab) => (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    backgroundColor: activeTab === tab.key ? tab.color + "22" : "#161616",
                    color: activeTab === tab.key ? tab.color : "#666",
                    border: `1px solid ${activeTab === tab.key ? tab.color : "#2a2a2a"}`,
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 rounded-full border-4 animate-spin"
                  style={{ borderColor: "#9C27B0", borderTopColor: "transparent" }} />
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {(activeTab === "queue" ? pendingCases : completedCases).length === 0 ? (
                  <div className="rounded-xl p-10 text-center"
                    style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
                    <p className="text-4xl mb-3">
                      {activeTab === "queue" ? "🎉" : "📋"}
                    </p>
                    <p className="text-white font-semibold">
                      {activeTab === "queue"
                        ? "No pending cases!"
                        : "No completed cases yet"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {activeTab === "queue"
                        ? "All cases have been interpreted"
                        : "Completed interpretations will appear here"}
                    </p>
                  </div>
                ) : (
                  (activeTab === "queue" ? pendingCases : completedCases).map((c) => {
                    const priority = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.STANDARD
                    const isSelected = selectedCase?.id === c.id
                    const isAssigned = c.assignedTo === session?.user?.id

                    return (
                      <div key={c.id}
                        className="rounded-xl p-4 transition-all cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? "#1e0a14" : "#161616",
                          border: `1px solid ${isSelected ? "#E91E8C" : priority.color + "33"}`,
                        }}
                        onClick={() => {
                          setSelectedCase(isSelected ? null : c)
                          setForm({
                            rhythm: "", rate: "", axis: "", intervals: "",
                            findings: "", conclusion: "", riskLevel: "NORMAL",
                            recommendations: "",
                          })
                        }}>

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                              style={{ backgroundColor: priority.color + "22" }}>
                              🫀
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">
                                {c.ecgUpload?.patient?.fullName}
                              </p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                DOB: {new Date(c.ecgUpload?.patient?.dateOfBirth).toLocaleDateString()}
                                {" · "}{c.ecgUpload?.patient?.gender}
                              </p>
                              {c.ecgUpload?.patient?.symptoms && (
                                <p className="text-xs mt-0.5" style={{ color: "#9C27B0" }}>
                                  ⚕ {c.ecgUpload.patient.symptoms}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: priority.color + "22",
                                color: priority.color,
                                border: `1px solid ${priority.color}55`,
                              }}>
                              {priority.label}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(c.createdAt).toLocaleDateString("en-NG", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* ECG file link */}
                        {c.ecgUpload?.fileUrl && (
                          <a href={c.ecgUpload.fileUrl} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg w-fit"
                            style={{ backgroundColor: "#00BCD422", color: "#00BCD4", border: "1px solid #00BCD433" }}>
                            📎 View ECG File
                          </a>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {!isAssigned && !c.interpretation && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAssign(c.id) }}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                              style={{ background: "linear-gradient(135deg, #9C27B0, #E91E8C)" }}>
                              Accept Case
                            </button>
                          )}
                          {isAssigned && !c.interpretation && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedCase(c) }}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                              style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
                              ✍ Interpret Now
                            </button>
                          )}
                          {c.interpretation && (
                            <>
                              <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                                style={{ backgroundColor: "#4CAF5022", color: "#4CAF50", border: "1px solid #4CAF5055" }}>
                                ✅ Interpreted
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleResendReport(c.id)
                                }}
                                disabled={resendingId === c.id}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                                style={{
                                  backgroundColor: resendingId === c.id ? "#555" : "#00BCD4",
                                }}>
                                {resendingId === c.id ? "Resending..." : "🔁 Resend Report"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Interpretation Form ── */}
          <div>
            {!selectedCase ? (
              <div className="rounded-xl p-12 flex flex-col items-center justify-center text-center h-full"
                style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}>
                <div className="text-5xl mb-4">📋</div>
                <p className="text-white font-bold mb-1">Select a case to interpret</p>
                <p className="text-gray-400 text-sm">
                  Click on any pending case from the queue to open the interpretation form
                </p>
                <div className="flex gap-1.5 mt-6">
                  {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
                    <div key={c} className="h-1 w-8 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-6"
                style={{ backgroundColor: "#161616", border: "1px solid #9C27B055" }}>

                {/* Case header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-white font-bold text-lg">
                      ECG Interpretation
                    </h2>
                    <p className="text-sm" style={{ color: "#9C27B0" }}>
                      {selectedCase.ecgUpload?.patient?.fullName}
                    </p>
                  </div>
                  <button onClick={() => setSelectedCase(null)}
                    className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                {/* Patient summary */}
                <div className="rounded-lg p-3 mb-5 grid grid-cols-3 gap-3"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                  {[
                    { label: "Patient",  value: selectedCase.ecgUpload?.patient?.fullName, color: "#E91E8C" },
                    { label: "DOB",      value: new Date(selectedCase.ecgUpload?.patient?.dateOfBirth).toLocaleDateString(), color: "#9C27B0" },
                    { label: "Gender",   value: selectedCase.ecgUpload?.patient?.gender, color: "#00BCD4" },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-gray-500">{f.label}</p>
                      <p className="text-sm font-semibold" style={{ color: f.color }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* ECG viewer link */}
                {selectedCase.ecgUpload?.fileUrl && (
                  <a href={selectedCase.ecgUpload.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold mb-5 text-white"
                    style={{ background: "linear-gradient(135deg, #00BCD4, #4CAF50)" }}>
                    🔍 Open ECG File in New Tab
                  </a>
                )}

                {selectedCase.interpretation ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="grid gap-4 sm:grid-cols-2 flex-1">
                        <div className="rounded-2xl bg-[#111111] p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Risk Level</p>
                          <p className="mt-2 text-white">{selectedCase.interpretation.riskLevel}</p>
                        </div>
                        <div className="rounded-2xl bg-[#111111] p-5">
                          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Doctor</p>
                          <p className="mt-2 text-white">{selectedCase.doctor?.name || "Assigned doctor"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResendReport(selectedCase.id)}
                        disabled={resendingId === selectedCase.id}
                        className="min-w-[180px] rounded-lg px-4 py-3 text-sm font-bold text-white"
                        style={{
                          backgroundColor: resendingId === selectedCase.id ? "#555" : "#00BCD4",
                        }}>
                        {resendingId === selectedCase.id ? "Resending..." : "🔁 Resend Report to Patient"}
                      </button>
                    </div>
                    <div className="rounded-2xl bg-[#111111] p-5">
                      <p className="text-sm text-white font-semibold">Findings</p>
                      <p className="mt-2 text-gray-300 whitespace-pre-line">{selectedCase.interpretation.findings}</p>
                    </div>
                    <div className="rounded-2xl bg-[#111111] p-5">
                      <p className="text-sm text-white font-semibold">Conclusion</p>
                      <p className="mt-2 text-gray-300 whitespace-pre-line">{selectedCase.interpretation.conclusion}</p>
                    </div>
                    <div className="rounded-2xl bg-[#111111] p-5">
                      <p className="text-sm text-white font-semibold">Recommendations</p>
                      <p className="mt-2 text-gray-300 whitespace-pre-line">{selectedCase.interpretation.recommendations || "No recommendations provided."}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitInterpretation} className="space-y-4">

                    {/* ECG Parameters */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: "#00BCD4" }}>
                        ECG Parameters
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: "rhythm",    label: "Rhythm",    placeholder: "e.g. Sinus rhythm", color: "#E91E8C" },
                          { name: "rate",      label: "Heart Rate",placeholder: "e.g. 72 bpm",       color: "#9C27B0" },
                          { name: "axis",      label: "Axis",      placeholder: "e.g. Normal axis",  color: "#00BCD4" },
                          { name: "intervals", label: "Intervals", placeholder: "e.g. PR 160ms",     color: "#4CAF50" },
                        ].map((f) => (
                          <div key={f.name}>
                            <label className="block text-xs font-medium mb-1"
                              style={{ color: f.color }}>
                              {f.label}
                            </label>
                            <input
                              type="text"
                              value={form[f.name as keyof typeof form]}
                              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                              placeholder={f.placeholder}
                              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
                              style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Findings */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: "#FFEB3B" }}>
                        Findings <span style={{ color: "#E91E8C" }}>*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={form.findings}
                        onChange={(e) => setForm({ ...form, findings: e.target.value })}
                        placeholder="Describe ECG findings in detail..."
                        className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none resize-none"
                        style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                      />
                    </div>

                    {/* Conclusion */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: "#9C27B0" }}>
                        Conclusion <span style={{ color: "#E91E8C" }}>*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={form.conclusion}
                        onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
                        placeholder="Clinical conclusion and diagnosis..."
                        className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none resize-none"
                        style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                      />
                    </div>

                    {/* Recommendations */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: "#4CAF50" }}>
                        Recommendations
                      </label>
                      <textarea
                        rows={2}
                        value={form.recommendations}
                        onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                        placeholder="Follow-up actions, referrals, medications..."
                        className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none resize-none"
                        style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                      />
                    </div>

                    {/* Risk Level */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: "#E91E8C" }}>
                        Risk Level <span style={{ color: "#E91E8C" }}>*</span>
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {RISK_LEVELS.map((r) => (
                          <button key={r.value} type="button"
                            onClick={() => setForm({ ...form, riskLevel: r.value })}
                            className="py-2 rounded-lg text-xs font-bold transition-all"
                            style={{
                              backgroundColor: form.riskLevel === r.value ? r.color + "33" : "#1a1a1a",
                              color: form.riskLevel === r.value ? r.color : "#666",
                              border: `1px solid ${form.riskLevel === r.value ? r.color : "#333"}`,
                            }}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitting}
                      className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: submitting
                          ? "#555"
                          : "linear-gradient(135deg, #E91E8C 0%, #9C27B0 50%, #00BCD4 100%)",
                      }}>
                      {submitting ? "Submitting..." : "Submit Interpretation →"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
