"use client"
import { useEffect, useState } from "react"

interface Flag { user_id: string; match_id: string; score: number; label: string }

export default function AdminDashboard() {
  const [flags, setFlags] = useState<Flag[]>([])
  useEffect(() => {
    fetch("http://localhost:3015/health").catch(() => {})
  }, [])
  return (
    <div>
      <h1 className="text-2xl font-semibold text-electricGreen">Moderator Dashboard</h1>
      <div className="mt-4 rounded border border-circuitBlue p-4">AC Flags stream connected.</div>
    </div>
  )
}