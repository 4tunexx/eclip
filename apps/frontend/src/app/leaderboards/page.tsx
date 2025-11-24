"use client"
import { useEffect, useState } from "react"

interface Entry {
  userId: string
  wins: number
  streak: number
  headshotRatio: number
  mvps: number
  clutches: number
  rating: number
}

export default function LeaderboardsPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  useEffect(() => {
    fetch("http://localhost:3001/leaderboards?period=daily").then(async r => {
      const json = await r.json()
      setEntries(json.entries)
    }).catch(() => setEntries([]))
  }, [])
  return (
    <div>
      <h1 className="text-2xl font-semibold text-electricGreen">Daily Leaderboard</h1>
      <div className="mt-4 overflow-x-auto rounded border border-circuitBlue">
        <table className="w-full text-sm">
          <thead className="bg-circuitBlue/20">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Rating</th>
              <th className="p-2 text-left">Wins</th>
              <th className="p-2 text-left">Streak</th>
              <th className="p-2 text-left">HS%</th>
              <th className="p-2 text-left">MVPs</th>
              <th className="p-2 text-left">Clutches</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: Entry) => (
              <tr key={e.userId} className="odd:bg-darkCyberGrey/40">
                <td className="p-2">{e.userId}</td>
                <td className="p-2">{e.rating}</td>
                <td className="p-2">{e.wins}</td>
                <td className="p-2">{e.streak}</td>
                <td className="p-2">{Math.round(e.headshotRatio * 100)}%</td>
                <td className="p-2">{e.mvps}</td>
                <td className="p-2">{e.clutches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}