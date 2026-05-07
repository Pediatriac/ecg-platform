// app/dashboard/upload/page.tsx
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signOut } from "next-auth/react"

const TIERS = [
  {
    id:    "STANDARD",
    label: "Standard Interpretation",
    price: "₦10,000",
    sla:   "48 hour turnaround",
    color: "#00BCD4",
    icon:  "📋",
    desc:  "Full ECG analysis with written report delivered within 48 hours.",
  },
  {
    id:    "URGENT",
    label: "Urgent Interpretation",
    price: "₦15,000",
    sla:   "6 hour turnaround",
    color: "#FFEB3B",
    icon:  "⚡",
    desc:  "Priority review by next available cardiologist within 6 hours.",
  },
  {
    id:    "DETAILED",
    label: "Detailed Specialist Report",
    price: "₦20,000",
    sla:   "With specialist notes",
    color: "#E91E8C",
    icon:  "🔬",
    desc:  "Comprehensive report with specialist consultation notes and recommendations.",
  },
]

const MAX_FILE_SIZE_MB = 10

export default function UploadPage() {
  const router       = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile]       = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [tier, setTier]       = useState("STANDARD")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [fileError, setFileError] = useState("")

  function handleFileSelect(selected: File) {
    setFileError("")
    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      return
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowed.includes(selected.type) && !selected.name.endsWith(".dcm")) {
      setFileError("Invalid file type. Please upload PDF, JPG, PNG, or DICOM.")
      return
    }
    setFile(selected)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!file) {
      setError("Please upload an ECG file before submitting.")
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("file", file)
    formData.append("tier", tier)

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Upload failed. Please try again.")
        setLoading(false)
        return
      }

      window.location.href = data.paymentUrl
    } catch {
      setError("Network error. Please check your connection and try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>

      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#111111", borderColor: "#2a2a2a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-0.5 rounded-full cursor-pointer flex-shrink-0"
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
            <p className="text-xs" style={{ color: "#00BCD4" }}>
              Submit ECG Report
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

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-1">
          Submit <span style={{ color: "#E91E8C" }}>ECG Report</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Follow the steps below to submit your child's ECG for expert interpretation.
        </p>

        {/* How it works — info cards NOT buttons */}
        <div
          className="rounded-xl p-5 mb-8"
          style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
        >
          <p className="text-white font-bold text-sm mb-4">
            📌 How the submission process works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                step:  "1",
                icon:  "📋",
                title: "Fill Patient Info",
                desc:  "Enter your child's details and any symptoms.",
                color: "#E91E8C",
              },
              {
                step:  "2",
                icon:  "📁",
                title: "Upload ECG File",
                desc:  "Upload the ECG file (PDF, JPG, PNG or DICOM). Max 10MB.",
                color: "#9C27B0",
              },
              {
                step:  "3",
                icon:  "💳",
                title: "Pay & Submit",
                desc:  "Choose a tier and complete secure payment to begin.",
                color: "#00BCD4",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "#1a1a1a",
                  border: `1px solid ${s.color}33`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: s.color + "22",
                      color: s.color,
                      border: `1px solid ${s.color}`,
                    }}
                  >
                    {s.step}
                  </div>
                  <span className="text-lg">{s.icon}</span>
                  <p className="text-white font-semibold text-xs">{s.title}</p>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-lg mb-4 text-sm"
            style={{
              backgroundColor: "#2d0a0a",
              color: "#f87171",
              border: "1px solid #7f1d1d",
            }}
          >
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Step 1: Patient Info ── */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: "#161616",
              border: "1px solid #E91E8C33",
            }}
          >
            <h2
              className="font-bold text-base mb-4 flex items-center gap-2"
              style={{ color: "#E91E8C" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: "#E91E8C" }}
              >
                1
              </span>
              Patient Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Patient Full Name <span style={{ color: "#E91E8C" }}>*</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Child's full name"
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                  style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Date of Birth <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    required
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none"
                    style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Gender <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <select
                    name="gender"
                    required
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none"
                    style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Symptoms / Clinical Notes
                </label>
                <textarea
                  name="symptoms"
                  rows={2}
                  placeholder="e.g. Palpitations, shortness of breath, syncope..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
                  style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                />
              </div>
            </div>
          </div>

          {/* ── Step 2: Upload File ── */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: "#161616",
              border: "1px solid #9C27B033",
            }}
          >
            <h2
              className="font-bold text-base mb-1 flex items-center gap-2"
              style={{ color: "#9C27B0" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: "#9C27B0" }}
              >
                2
              </span>
              Upload ECG File
            </h2>
            <p className="text-gray-500 text-xs mb-3 ml-8">
              Accepted: PDF, JPG, PNG, DICOM (.dcm) — Maximum size: 10MB
            </p>

            {fileError && (
              <div
                className="px-3 py-2 rounded-lg mb-3 text-xs"
                style={{
                  backgroundColor: "#2d0a0a",
                  color: "#f87171",
                  border: "1px solid #7f1d1d",
                }}
              >
                ❌ {fileError}
              </div>
            )}

            <div
              className="rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${
                  dragOver ? "#9C27B0" : file ? "#4CAF50" : "#333"
                }`,
                backgroundColor: dragOver
                  ? "#9C27B011"
                  : file
                  ? "#4CAF5011"
                  : "#1a1a1a",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileSelect(f)
                }}
              />

              {file ? (
                <>
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-white font-semibold text-sm">{file.name}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setFileError("")
                    }}
                    className="mt-2 text-xs px-3 py-1 rounded-lg"
                    style={{ color: "#E91E8C", border: "1px solid #E91E8C33" }}
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-white font-semibold text-sm">
                    Tap to select your ECG file
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    or drag and drop here
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── Step 3: Select Tier ── */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: "#161616",
              border: "1px solid #00BCD433",
            }}
          >
            <h2
              className="font-bold text-base mb-1 flex items-center gap-2"
              style={{ color: "#00BCD4" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: "#00BCD4" }}
              >
                3
              </span>
              Select Interpretation Tier
            </h2>
            <p className="text-gray-500 text-xs mb-4 ml-8">
              Choose the level of service that suits your needs
            </p>

            <div className="space-y-3">
              {TIERS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className="rounded-xl p-4 cursor-pointer transition-all"
                  style={{
                    backgroundColor: tier === t.id ? t.color + "11" : "#1a1a1a",
                    border: `2px solid ${tier === t.id ? t.color : "#2a2a2a"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{t.icon}</span>
                      <div>
                        <p
                          className="font-bold text-sm"
                          style={{ color: tier === t.id ? t.color : "white" }}
                        >
                          {t.label}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">{t.desc}</p>
                        <p className="text-gray-500 text-xs mt-1">⏱ {t.sla}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-lg font-extrabold"
                        style={{ color: "#4CAF50" }}
                      >
                        {t.price}
                      </p>
                      {tier === t.id && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: t.color + "22",
                            color: t.color,
                          }}
                        >
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-4 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? "#555"
                : "linear-gradient(135deg, #E91E8C 0%, #9C27B0 50%, #00BCD4 100%)",
            }}
          >
            {loading
              ? "Uploading & Processing..."
              : "Submit ECG & Proceed to Payment →"}
          </button>

          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <span>🔒</span>
            <span>Your files are encrypted and stored securely</span>
          </div>
        </form>
      </main>
    </div>
  )
}