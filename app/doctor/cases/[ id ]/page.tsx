"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  STANDARD: { label: "Standard", color: "#00BCD4" },
  URGENT: { label: "Urgent", color: "#E91E8C" },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "#FFEB3B" },
  PAID: { label: "Paid", color: "#00BCD4" },
  ASSIGNED: { label: "Assigned", color: "#9C27B0" },
  IN_REVIEW: { label: "In Review", color: "#E91E8C" },
  COMPLETED: { label: "Completed", color: "#4CAF50" },
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatCurrency(amount?: number) {
  if (typeof amount !== "number") return "—"
  return `₦${(amount / 100).toLocaleString()}`
}

export default function DoctorCaseDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    if (status === "authenticated" && session?.user?.role !== "DOCTOR") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    const caseId = pathname?.split("/").filter(Boolean).pop()
    if (!caseId) {
      setError("Invalid case URL.")
      setLoading(false)
      return
    }

    setLoading(true)
    fetch("/api/doctor/cases")
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data.cases)
          ? data.cases.find((item: any) => item.id === caseId)
          : null

        if (!found) {
          setError("Case not found or you do not have access.")
          setCaseData(null)
        } else {
          setCaseData(found)
          setError("")
        }
      })
      .catch(() => {
        setError("Unable to load case details.")
      })
      .finally(() => setLoading(false))
  }, [pathname])

  const backUrl = "/doctor"
  const statusLabel = caseData?.ecgUpload?.status
    ? STATUS_LABELS[caseData.ecgUpload.status]?.label || caseData.ecgUpload.status
    : "Unknown"
  const statusColor = caseData?.ecgUpload?.status
    ? STATUS_LABELS[caseData.ecgUpload.status]?.color || "#9C27B0"
    : "#9C27B0"
  const priority = caseData?.priority || "STANDARD"
  const priorityLabel = PRIORITY_LABELS[priority]?.label || priority
  const priorityColor = PRIORITY_LABELS[priority]?.color || "#00BCD4"

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen px-6 py-10" style={{ backgroundColor: "#0a0a0a" }}>
        <button
          onClick={() => router.push(backUrl)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "#2a2a2a" }}
        >
          ← Back to queue
        </button>

        <div className="rounded-3xl border px-8 py-14 text-center"
          style={{ backgroundColor: "#161616", borderColor: "#2a2a2a" }}>
          <p className="text-3xl mb-4" style={{ color: "#E91E8C" }}>⚠️</p>
          <p className="text-white text-xl font-semibold mb-2">{error}</p>
          <p className="text-gray-400">Please return to the doctor queue and choose another case.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      <nav className="flex flex-col gap-4 px-6 py-6 border-b sm:flex-row sm:items-center sm:justify-between"
        style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}>
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-full" style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4)" }}>
            <div className="rounded-full p-1" style={{ backgroundColor: "#111111" }}>
              <Image src="/Xseve.png" alt="Logo" width={36} height={36} className="rounded-full object-contain" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Doctor Review</p>
            <p className="text-xs" style={{ color: "#9C27B0" }}>Case details</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(backUrl)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "#2a2a2a" }}
          >
            ← Back to queue
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "#E91E8C" }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="flex h-1">
        { ["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        )) }
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-400">Case overview</p>
            <h1 className="text-3xl font-bold text-white">ECG Case Review</h1>
            <p className="text-gray-400 mt-2 text-sm max-w-2xl">
              Review the details of this patient case, confirm payment and complete the interpretation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: priorityColor + "22", color: priorityColor, border: `1px solid ${priorityColor}33` }}>
              {priorityLabel}
            </span>
            <span className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}33` }}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border p-6"
            style={{ backgroundColor: "#161616", borderColor: "#2a2a2a" }}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">Patient</p>
                <h2 className="text-2xl font-bold text-white">{caseData.ecgUpload?.patient?.fullName || "Unknown patient"}</h2>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Case ID</p>
                <p className="text-sm text-gray-200 break-all">{caseData.id}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#111111] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">DOB</p>
                <p className="mt-2 text-white">{formatDate(caseData.ecgUpload?.patient?.dateOfBirth)}</p>
              </div>
              <div className="rounded-2xl bg-[#111111] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Gender</p>
                <p className="mt-2 text-white">{caseData.ecgUpload?.patient?.gender || "—"}</p>
              </div>
              <div className="rounded-2xl bg-[#111111] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Uploaded</p>
                <p className="mt-2 text-white">{formatDateTime(caseData.createdAt)}</p>
              </div>
              <div className="rounded-2xl bg-[#111111] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">ECG file</p>
                <p className="mt-2 text-white">{caseData.ecgUpload?.fileType || "Unknown"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#111111] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Payment</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-white">{formatCurrency(caseData.ecgUpload?.payment?.amount)}</p>
                  <p className="text-xs text-gray-400">{caseData.ecgUpload?.payment?.status || "pending"}</p>
                </div>
                <div className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: (caseData.ecgUpload?.payment?.status === "success" ? "#4CAF5022" : "#FFEB3B22"), color: (caseData.ecgUpload?.payment?.status === "success" ? "#4CAF50" : "#FFEB3B") }}>
                  {caseData.ecgUpload?.payment?.status === "success" ? "Paid" : "Unpaid"}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border-t border-[#2a2a2a] pt-6">
              <h3 className="text-sm uppercase tracking-[0.24em] text-gray-500">Interpretation</h3>
              {caseData.interpretation ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#111111] p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Risk Level</p>
                      <p className="mt-2 text-white">{caseData.interpretation.riskLevel}</p>
                    </div>
                    <div className="rounded-2xl bg-[#111111] p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Doctor</p>
                      <p className="mt-2 text-white">{caseData.doctor?.name || "Assigned doctor"}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#111111] p-5">
                    <p className="text-sm text-white font-semibold">Findings</p>
                    <p className="mt-2 text-gray-300 whitespace-pre-line">{caseData.interpretation.findings}</p>
                  </div>
                  <div className="rounded-2xl bg-[#111111] p-5">
                    <p className="text-sm text-white font-semibold">Conclusion</p>
                    <p className="mt-2 text-gray-300 whitespace-pre-line">{caseData.interpretation.conclusion}</p>
                  </div>
                  <div className="rounded-2xl bg-[#111111] p-5">
                    <p className="text-sm text-white font-semibold">Recommendations</p>
                    <p className="mt-2 text-gray-300 whitespace-pre-line">{caseData.interpretation.recommendations || "No recommendations provided."}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-[#111111] p-6 text-gray-300">
                  This case has not yet been interpreted. Use the main doctor queue to assign and review interpretations.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border p-6"
              style={{ backgroundColor: "#161616", borderColor: "#2a2a2a" }}>
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Assigned Doctor</p>
              <p className="mt-3 text-white text-lg font-semibold">{caseData.doctor?.name || "Not yet assigned"}</p>
              <p className="mt-2 text-gray-400 text-sm">Assigned on: {formatDate(caseData.dueAt)}</p>
            </div>

            <div className="rounded-3xl border p-6"
              style={{ backgroundColor: "#161616", borderColor: "#2a2a2a" }}>
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500">ECG Summary</p>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <p><span className="font-semibold text-white">File URL:</span> <br />
                  <a href={caseData.ecgUpload?.fileUrl}
                    className="text-blue-400 break-all"
                    target="_blank"
                    rel="noreferrer">
                    {caseData.ecgUpload?.fileUrl || "Unavailable"}
                  </a>
                </p>
                <p><span className="font-semibold text-white">Priority:</span> {priorityLabel}</p>
                <p><span className="font-semibold text-white">Created:</span> {formatDateTime(caseData.createdAt)}</p>
                <p><span className="font-semibold text-white">Due At:</span> {formatDate(caseData.dueAt)}</p>
              </div>
            </div>

            {caseData.interpretation?.reportUrl && (
              <a
                href={caseData.interpretation.reportUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-3xl px-6 py-4 text-center font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #4CAF50, #00BCD4)" }}>
                Download final report
              </a>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
