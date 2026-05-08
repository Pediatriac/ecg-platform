// app/admin/page.tsx
"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Image from "next/image"

const ROLE_COLORS: Record<string, string> = {
  ADMIN:   "#E91E8C",
  DOCTOR:  "#9C27B0",
  PATIENT: "#00BCD4",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "#FFEB3B",
  PAID:      "#00BCD4",
  ASSIGNED:  "#9C27B0",
  IN_REVIEW: "#E91E8C",
  COMPLETED: "#4CAF50",
}

function AdminPanelContent() {
  const { data: session, status } = useSession()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab]       = useState<"overview" | "cases" | "users">("overview")
  const [stats, setStats]               = useState<any>(null)
  const [recentPayments, setRecent]     = useState<any[]>([])
  const [users, setUsers]               = useState<any[]>([])
  const [cases, setCases]               = useState<any[]>([])
  const [doctors, setDoctors]           = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [bulkAssigning, setBulkAssigning] = useState(false)

  // Read tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "cases" || tab === "users" || tab === "overview") {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated") loadAll()
  }, [status])

  async function loadAll() {
    setLoading(true)
    const [statsRes, usersRes, casesRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/users"),
      fetch("/api/admin/cases"),
    ])

    const statsData = await statsRes.json()
    const usersData = await usersRes.json()
    const casesData = await casesRes.json()

    setStats(statsData.stats)
    setRecent(statsData.recentPayments || [])
    setUsers(usersData.users || [])
    setCases(casesData.cases || [])
    setDoctors((usersData.users || []).filter((u: any) => u.role === "DOCTOR"))
    setLoading(false)
  }

  async function handleBulkAssign(caseIds: string[], doctorId: string) {
    setBulkAssigning(true)
    try {
      const promises = caseIds.map(caseId =>
        fetch("/api/admin/cases", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId, doctorId }),
        })
      )
      await Promise.all(promises)
      showToast(`${caseIds.length} cases assigned successfully!`)
      loadAll()
    } catch (error) {
      showToast("Failed to assign some cases")
    }
    setBulkAssigning(false)
  }

  async function handleRoleChange(userId: string, role: string) {
    setUpdatingRole(userId)
    const res = await fetch("/api/admin/users", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId, role }),
    })
    if (res.ok) {
      showToast("User role updated!")
      loadAll()
    }
    setUpdatingRole(null)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Amount", "Status", "Date"],
      ...recentPayments.map((p) => [
        p.user?.name,
        p.user?.email,
        `₦${(p.amount / 100).toLocaleString()}`,
        p.status,
        new Date(p.paidAt).toLocaleDateString(),
      ]),
    ]
    const csv  = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = "ecg-payments.csv"
    a.click()
  }

  if (status === "loading" || loading) {
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
          <p className="text-gray-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  const TABS = [
    { key: "overview", label: "Overview", icon: "📊", color: "#E91E8C" },
    { key: "cases",    label: "Cases",    icon: "🫀", color: "#9C27B0" },
    { key: "users",    label: "Users",    icon: "👥", color: "#00BCD4" },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-xl"
          style={{ backgroundColor: "#4CAF50", color: "white" }}
        >
          ✅ {toast}
        </div>
      )}

      {/* Navbar */}
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
            <p className="text-xs" style={{ color: "#E91E8C" }}>
              Admin Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs" style={{ color: "#E91E8C" }}>
              Administrator
            </p>
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

      {/* Color strip */}
      <div className="flex h-1">
        {["#E91E8C", "#9C27B0", "#4CAF50", "#00BCD4", "#FFEB3B"].map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Admin <span style={{ color: "#E91E8C" }}>Control Panel</span>
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Manage users, cases, and revenue
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4CAF50, #00BCD4)" }}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any)
                router.push(`/admin?tab=${tab.key}`, { scroll: false })
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              style={{
                backgroundColor:
                  activeTab === tab.key ? tab.color + "22" : "#161616",
                color: activeTab === tab.key ? tab.color : "#666",
                border: `1px solid ${
                  activeTab === tab.key ? tab.color : "#2a2a2a"
                }`,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users",     value: stats?.totalUsers,        color: "#E91E8C", icon: "👥" },
                { label: "Total Cases",     value: stats?.totalCases,        color: "#9C27B0", icon: "🫀" },
                { label: "Pending Cases",   value: stats?.pendingCases,      color: "#FFEB3B", icon: "⏳" },
                { label: "Completed Cases", value: stats?.completedCases,    color: "#4CAF50", icon: "✅" },
                { label: "Total Doctors",   value: stats?.totalDoctors,      color: "#9C27B0", icon: "👨‍⚕️" },
                { label: "Total Patients",  value: stats?.totalPatients,     color: "#00BCD4", icon: "🧒" },
                { label: "Transactions",    value: stats?.totalTransactions, color: "#FFEB3B", icon: "💳" },
                {
                  label: "Total Revenue",
                  value: `₦${((stats?.totalRevenue || 0) / 100).toLocaleString()}`,
                  color: "#4CAF50",
                  icon: "💰",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-5 flex flex-col gap-2"
                  style={{
                    backgroundColor: "#161616",
                    border: `1px solid ${s.color}33`,
                  }}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-2xl font-extrabold" style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue breakdown */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "#161616", border: "1px solid #4CAF5033" }}
            >
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <span style={{ color: "#4CAF50" }}>💰</span> Revenue Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Gross Revenue",
                    value: `₦${((stats?.totalRevenue || 0) / 100).toLocaleString()}`,
                    color: "#4CAF50",
                  },
                  {
                    label: "Annual Maintenance Cost",
                    value: "₦700,000",
                    color: "#FFEB3B",
                  },
                  {
                    label: "Net Revenue",
                    value: `₦${Math.max(
                      0,
                      (stats?.totalRevenue || 0) / 100 - 700000
                    ).toLocaleString()}`,
                    color: "#00BCD4",
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: `1px solid ${r.color}33`,
                    }}
                  >
                    <p className="text-gray-400 text-xs mb-1">{r.label}</p>
                    <p className="text-2xl font-extrabold" style={{ color: r.color }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent payments */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "#161616", border: "1px solid #00BCD433" }}
            >
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <span style={{ color: "#00BCD4" }}>💳</span> Recent Payments
              </h2>
              {recentPayments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No payments yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-lg"
                      style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                      }}
                    >
                      <div>
                        <p className="text-white text-sm font-semibold">
                          {p.user?.name}
                        </p>
                        <p className="text-gray-400 text-xs">{p.user?.email}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Patient: {p.ecgUpload?.patient?.fullName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold" style={{ color: "#4CAF50" }}>
                          ₦{(p.amount / 100).toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CASES TAB ── */}
        {activeTab === "cases" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-white font-bold text-lg">
                All Cases{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({cases.length} total)
                </span>
              </h2>
              <div className="flex items-center gap-3">
                {selectedCases.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {selectedCases.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedCases([])}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                    <select
                      onChange={async (e) => {
                        if (!e.target.value) return
                        await handleBulkAssign(selectedCases, e.target.value)
                        setSelectedCases([])
                        e.target.value = ""
                      }}
                      disabled={bulkAssigning}
                      className="text-xs rounded-lg px-3 py-1.5 text-white focus:outline-none"
                      style={{
                        backgroundColor: "#222",
                        border: "1px solid #9C27B055",
                      }}
                    >
                      <option value="">Bulk assign to...</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.name}
                        </option>
                      ))}
                    </select>
                    {bulkAssigning && (
                      <span className="text-xs" style={{ color: "#9C27B0" }}>
                        Assigning...
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => router.push("/doctor")}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #9C27B0, #E91E8C)" }}
                >
                  👨‍⚕️ Open Doctor Dashboard
                </button>
              </div>
            </div>

            {cases.length === 0 ? (
              <div
                className="rounded-xl p-12 text-center"
                style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a" }}
              >
                <p className="text-4xl mb-3">🫀</p>
                <p className="text-white font-semibold">No cases yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ── Prominent Assignment Section ── */}
                {cases.some(c => !c.interpretation && !c.doctor) && (
                  <div
                    className="rounded-xl p-6 border-l-4"
                    style={{
                      backgroundColor: "#161616",
                      borderColor: "#9C27B0",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          👨‍⚕️ Assign Doctors to Cases
                        </h3>
                        <p className="text-sm text-gray-400">
                          {cases.filter(c => !c.interpretation && !c.doctor).length} case(s) waiting for assignment
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const unassignedIds = cases
                              .filter(c => !c.interpretation && !c.doctor)
                              .map(c => c.id)
                            setSelectedCases(unassignedIds)
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                          style={{ backgroundColor: "#222" }}
                        >
                          Select All
                        </button>
                        <select
                          onChange={async (e) => {
                            if (!e.target.value) return
                            const unassignedIds = cases
                              .filter(c => !c.interpretation && !c.doctor)
                              .map(c => c.id)
                            await handleBulkAssign(unassignedIds, e.target.value)
                            e.target.value = ""
                          }}
                          disabled={bulkAssigning || doctors.length === 0}
                          className="text-sm rounded-lg px-4 py-2 text-white focus:outline-none"
                          style={{
                            backgroundColor: "#222",
                            border: "1px solid #9C27B055",
                          }}
                        >
                          <option value="">Assign all to...</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id}>
                              Dr. {d.name}
                            </option>
                          ))}
                        </select>
                        {bulkAssigning && (
                          <span className="text-sm" style={{ color: "#9C27B0" }}>
                            Assigning...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Cases List ── */}
                {cases.length > 0 ? (
                  <div className="space-y-3">
                    {cases.map((c) => {
                      const statusColor = STATUS_COLORS[c.ecgUpload?.status] || "#666"
                      const isSelected = selectedCases.includes(c.id)
                      return (
                        <div
                          key={c.id}
                          className="rounded-xl p-5"
                          style={{
                            backgroundColor: "#161616",
                            border: `1px solid ${statusColor}33`,
                          }}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Selection checkbox */}
                        {!c.interpretation && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCases(prev => [...prev, c.id])
                              } else {
                                setSelectedCases(prev => prev.filter(id => id !== c.id))
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                          />
                        )}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: statusColor + "22" }}
                        >
                          🫀
                        </div>
                        <div>
                          <p className="text-white font-bold">
                            {c.ecgUpload?.patient?.fullName}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            DOB:{" "}
                            {new Date(
                              c.ecgUpload?.patient?.dateOfBirth
                            ).toLocaleDateString()}
                            {" · "}
                            {c.ecgUpload?.patient?.gender}
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

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: statusColor + "22",
                            color: statusColor,
                            border: `1px solid ${statusColor}55`,
                          }}
                        >
                          {c.ecgUpload?.status}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              c.priority === "URGENT" ? "#E91E8C22" : "#00BCD422",
                            color:
                              c.priority === "URGENT" ? "#E91E8C" : "#00BCD4",
                            border: `1px solid ${
                              c.priority === "URGENT" ? "#E91E8C55" : "#00BCD455"
                            }`,
                          }}
                        >
                          {c.priority === "URGENT" ? "⚡ Urgent" : "📋 Standard"}
                        </span>
                        {c.ecgUpload?.payment && (
                          <span
                            className="text-xs"
                            style={{
                              color:
                                c.ecgUpload.payment.status === "success"
                                  ? "#4CAF50"
                                  : "#FFEB3B",
                            }}
                          >
                            ₦{(c.ecgUpload.payment.amount / 100).toLocaleString()}{" "}
                            ·{" "}
                            {c.ecgUpload.payment.status === "success"
                              ? "Paid"
                              : "Unpaid"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Doctor assignment */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">Assigned to:</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: c.doctor ? "#9C27B0" : "#666" }}
                        >
                          {c.doctor ? `Dr. ${c.doctor.name}` : "Unassigned"}
                        </span>
                      </div>

                      {!c.interpretation && doctors.length > 0 && (
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignDoctor(c.id, e.target.value)
                              }
                            }}
                            className="text-xs rounded-lg px-3 py-1.5 text-white focus:outline-none"
                            style={{
                              backgroundColor: "#222",
                              border: "1px solid #9C27B055",
                            }}
                          >
                            <option value="">Assign doctor...</option>
                            {doctors.map((d) => (
                              <option key={d.id} value={d.id}>
                                Dr. {d.name}
                              </option>
                            ))}
                          </select>
                          {assigning === c.id && (
                            <span className="text-xs" style={{ color: "#9C27B0" }}>
                              Assigning...
                            </span>
                          )}
                        </div>
                      )}

                      {c.interpretation && (
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-lg"
                          style={{
                            backgroundColor: "#4CAF5022",
                            color: "#4CAF50",
                            border: "1px solid #4CAF5055",
                          }}
                        >
                          ✅ Interpretation Complete
                        </span>
                      )}
                    </div>

                    {c.ecgUpload?.fileUrl && (
                      <a
                        href={c.ecgUpload.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{
                          backgroundColor: "#00BCD422",
                          color: "#00BCD4",
                          border: "1px solid #00BCD433",
                        }}
                      >
                        📎 View ECG File
                      </a>
                    )}
                  </div>
                )
              })
            }
                  </div>
                ) : null}
            </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white font-bold text-lg mb-2">
                All Users{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({users.length} total)
                </span>
              </h2>
              <p className="text-gray-400 text-sm">
                Manage user accounts and assign roles. Doctors can interpret ECG cases, patients submit reports, and admins manage the platform.
              </p>
            </div>

            {/* Role summary */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[
                { role: "PATIENT", color: "#00BCD4", icon: "🧒" },
                { role: "DOCTOR",  color: "#9C27B0", icon: "👨‍⚕️" },
                { role: "ADMIN",   color: "#E91E8C", icon: "🛡" },
              ].map((r) => (
                <div
                  key={r.role}
                  className="rounded-xl p-4 text-center"
                  style={{
                    backgroundColor: "#161616",
                    border: `1px solid ${r.color}33`,
                  }}
                >
                  <p className="text-xl mb-1">{r.icon}</p>
                  <p className="text-xl font-extrabold" style={{ color: r.color }}>
                    {users.filter((u) => u.role === r.role).length}
                  </p>
                  <p className="text-gray-400 text-xs capitalize">
                    {r.role.toLowerCase()}s
                  </p>
                </div>
              ))}
            </div>

            {/* Users list */}
            {users.map((u) => {
              const roleColor = ROLE_COLORS[u.role] || "#666"
              return (
                <div
                  key={u.id}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "#161616",
                    border: `1px solid ${roleColor}22`,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          backgroundColor: roleColor + "22",
                          color: roleColor,
                        }}
                      >
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Joined:{" "}
                          {new Date(u.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        {u.role === "PATIENT" && (
                          <p className="text-gray-500 text-xs mt-1">
                            📊 {u._count?.payments || 0} ECG submission(s)
                          </p>
                        )}
                        {u.role === "DOCTOR" && (
                          <p className="text-gray-500 text-xs mt-1">
                            ✅ {u._count?.interpretations || 0} case(s) interpreted
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: roleColor + "22",
                          color: roleColor,
                          border: `1px solid ${roleColor}55`,
                        }}
                      >
                        {u.role}
                      </span>

                      {u.id !== session?.user?.id && (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={updatingRole === u.id}
                          className="text-xs rounded-lg px-3 py-1.5 text-white focus:outline-none"
                          style={{
                            backgroundColor: "#222",
                            border: `1px solid ${roleColor}55`,
                          }}
                        >
                          <option value="PATIENT">Patient</option>
                          <option value="DOCTOR">Doctor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}

                      {updatingRole === u.id && (
                        <span className="text-xs" style={{ color: "#FFEB3B" }}>
                          Updating...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function AdminPanel() {
  return (
    <Suspense>
      <AdminPanelContent />
    </Suspense>
  )
}

function setUpdatingRole(userId: string) {
  throw new Error("Function not implemented.")
}
function setToast(msg: string) {
  throw new Error("Function not implemented.")
}

