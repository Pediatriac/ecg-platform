 // app/dashboard/upload/page.tsx
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signOut } from "next-auth/react"

const TIERS = [
  {
    id: "STANDARD",
    label: "Standard",
    price: "₦10,000",
    sla: "48 hour turnaround",
    color: "#00BCD4",
    icon: "📋",
  },
  {
    id: "URGENT",
    label: "Urgent",
    price: "₦15,000",
    sla: "6 hour turnaround",
    color: "#FFEB3B",
    icon: "⚡",
  },
  {
    id: "DETAILED",
    label: "Detailed Report",
    price: "₦20,000",
    sla: "With specialist notes",
    color: "#E91E8C",
    icon: "🔬",
  },
]

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [tier, setTier] = useState("STANDARD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // 1=patient info, 2=upload file, 3=select tier

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!file) {
      setError("Please upload an ECG file")
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("file", file)
    formData.append("tier", tier)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Upload failed")
      setLoading(false)
      return
    }

    // Redirect to Paystack payment page
    window.location.href = data.paymentUrl
  }

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
              background:
                "linear-gradient(135deg, #E91E8C, #9C27B0, #00BCD4, #4CAF50, #FFEB3B)",
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
            <p className="text-xs" style={{ color: "#00BCD4" }}>
              Upload ECG
            </p>
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Submit <span style={{ color: "#E91E8C" }}>ECG Report</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Fill in patient details, upload the ECG file, and complete payment to begin interpretation.
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Patient Info", color: "#E91E8C" },
            { n: 2, label: "Upload File", color: "#9C27B0" },
            { n: 3, label: "Select Tier", color: "#00BCD4" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.n)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: step >= s.n ? s.color : "#2a2a2a",
                    color: step >= s.n ? "white" : "#666",
                  }}
                >
                  {step > s.n ? "✓" : s.n}
                </div>
                <span
                  className="text-sm font-medium hidden sm:block"
                  style={{ color: step >= s.n ? s.color : "#666" }}
                >
                  {s.label}
                </span>
              </button>
              {i < 2 && (
                <div
                  className="flex-1 h-0.5 w-8"
                  style={{ backgroundColor: step > s.n ? s.color : "#2a2a2a" }}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-lg mb-6 text-sm"
            style={{
              backgroundColor: "#2d0a0a",
              color: "#f87171",
              border: "1px solid #7f1d1d",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── Step 1: Patient Info ── */}
          <div
            className="rounded-xl p-6 mb-4"
            style={{
              backgroundColor: "#161616",
              border: `1px solid ${step === 1 ? "#E91E8C55" : "#2a2a2a"}`,
            }}
          >
            <h2
              className="font-bold text-lg mb-4 flex items-center gap-2"
              style={{ color: "#E91E8C" }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "#E91E8C" }}
              >
                1
              </span>
              Patient Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Patient Full Name <span style={{ color: "#E91E8C" }}>*</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Child's full name"
                  className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                  style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date of Birth <span style={{ color: "#E91E8C" }}>*</span>
                </label>
                <input
                  name="dateOfBirth"
                  type="date"
                  required
                  className="w-full rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                  style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gender <span style={{ color: "#E91E8C" }}>*</span>
                </label>
                <select
                  name="gender"
                  required
                  className="w-full rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                  style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Symptoms / Clinical Notes
                </label>
                <textarea
                  name="symptoms"
                  rows={3}
                  placeholder="e.g. Palpitations, shortness of breath, syncope..."
                  className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
                  style={{ backgroundColor: "#222222", border: "1px solid #333333" }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-4 px-6 py-2 rounded-lg text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}
            >
              Next: Upload File →
            </button>
          </div>

          {/* ── Step 2: Upload File ── */}
          <div
            className="rounded-xl p-6 mb-4"
            style={{
              backgroundColor: "#161616",
              border: `1px solid ${step === 2 ? "#9C27B055" : "#2a2a2a"}`,
            }}
          >
            <h2
              className="font-bold text-lg mb-4 flex items-center gap-2"
              style={{ color: "#9C27B0" }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "#9C27B0" }}
              >
                2
              </span>
              Upload ECG File
            </h2>

            {/* Dropzone */}
            <div
              className="rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${dragOver ? "#9C27B0" : file ? "#4CAF50" : "#333"}`,
                backgroundColor: dragOver ? "#9C27B011" : file ? "#4CAF5011" : "#1a1a1a",
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
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              {file ? (
                <>
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    className="mt-3 text-xs px-3 py-1 rounded-lg"
                    style={{ color: "#E91E8C", border: "1px solid #E91E8C33" }}
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-white font-semibold">
                    Drop your ECG file here
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    or click to browse
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    Accepted: PDF, JPG, PNG, DICOM (.dcm)
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="mt-4 px-6 py-2 rounded-lg text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #9C27B0, #00BCD4)" }}
            >
              Next: Select Tier →
            </button>
          </div>

          {/* ── Step 3: Select Tier ── */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{
              backgroundColor: "#161616",
              border: `1px solid ${step === 3 ? "#00BCD455" : "#2a2a2a"}`,
            }}
          >
            <h2
              className="font-bold text-lg mb-4 flex items-center gap-2"
              style={{ color: "#00BCD4" }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "#00BCD4" }}
              >
                3
              </span>
              Select Interpretation Tier
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: tier === t.id ? t.color + "22" : "#1a1a1a",
                    border: `2px solid ${tier === t.id ? t.color : "#333"}`,
                  }}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: tier === t.id ? t.color : "white" }}
                  >
                    {t.label}
                  </p>
                  <p
                    className="text-xl font-extrabold mt-1"
                    style={{ color: t.color }}
                  >
                    {t.price}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{t.sla}</p>
                  {tier === t.id && (
                    <div
                      className="mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: t.color + "33", color: t.color }}
                    >
                      ✓ Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-center text-gray-500 text-xs mt-3">
            🔒 Your files are encrypted and stored securely
          </p>
        </form>
      </main>
    </div>
  )
}
