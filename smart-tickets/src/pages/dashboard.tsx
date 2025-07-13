"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user || !user.role) {
      router.push("/login") // not authenticated or malformed user object
      return
    }

    switch (user.role) {
      case "admin":
        router.push("/admin")
        break
      case "moderator":
        router.push("/moderator")
        break
      case "user":
        router.push("/user")
        break
      default:
        router.push("/login") // fallback
        break
    }
  }, [router])

  return <p className="p-4">Redirecting to your dashboard…</p>
}
