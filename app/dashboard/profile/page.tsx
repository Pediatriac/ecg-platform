import { Suspense } from "react"
import ProfileClient from "./ProfileClient"

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }} />
      </div>
    }>
      <ProfileClient />
    </Suspense>
  )
}
