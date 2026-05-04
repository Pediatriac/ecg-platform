// app/admin/cases/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminCasesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin?tab=cases")
  }, [router])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: "#9C27B0", borderTopColor: "transparent" }}
        />
        <p className="text-gray-400 text-sm">Loading cases...</p>
      </div>
    </div>
  )
}