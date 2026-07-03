import { useState } from 'react'
import Players from './Players'
import PointsSettings from './PointsSettings'

const SECTIONS = [
  { key: 'players', label: 'Joueurs', icon: '👤', description: 'Ajouter, supprimer des joueurs', Component: Players },
  { key: 'points', label: 'Points', icon: '🎯', description: 'Barème de points par victoire/défaite', Component: PointsSettings },
]

export default function Settings() {
  const [section, setSection] = useState(null)

  if (section) {
    const { Component } = SECTIONS.find((s) => s.key === section)
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSection(null)}
          className="text-sm text-slate-400 hover:text-slate-100 flex items-center gap-1"
        >
          ← Réglages
        </button>
        <Component />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Réglages</h2>

      <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
        {SECTIONS.map((s) => (
          <li key={s.key}>
            <button
              onClick={() => setSection(s.key)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/50 hover:bg-slate-900 text-left transition"
            >
              <span className="text-lg">{s.icon}</span>
              <span className="flex-1">
                <span className="block font-medium">{s.label}</span>
                <span className="block text-xs text-slate-500">{s.description}</span>
              </span>
              <span className="text-slate-600">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
