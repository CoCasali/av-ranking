import { useState } from 'react'
import { useAsyncList } from '../useAsyncList'
import * as api from '../api'
import { useToast } from '../components/Toast'

function todayInput() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

export default function NewResult() {
  const showToast = useToast()
  const [players] = useAsyncList(api.listPlayers)
  const [presentIds, setPresentIds] = useState([])
  const [teamA, setTeamA] = useState([])
  const [teamB, setTeamB] = useState([])
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [date, setDate] = useState(todayInput)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function togglePresent(id) {
    if (presentIds.includes(id)) {
      setPresentIds(presentIds.filter((x) => x !== id))
      setTeamA(teamA.filter((x) => x !== id))
      setTeamB(teamB.filter((x) => x !== id))
    } else {
      setPresentIds([...presentIds, id])
    }
  }

  function assignTeam(id, team) {
    const current = teamA.includes(id) ? 'A' : teamB.includes(id) ? 'B' : null
    const next = current === team ? null : team

    setTeamA((prev) => {
      const withoutId = prev.filter((x) => x !== id)
      return next === 'A' ? [...withoutId, id] : withoutId
    })
    setTeamB((prev) => {
      const withoutId = prev.filter((x) => x !== id)
      return next === 'B' ? [...withoutId, id] : withoutId
    })
  }

  const sA = Number(scoreA)
  const sB = Number(scoreB)

  // Raison de blocage du submit (null = valide). Sert à la validation live.
  function validate() {
    if (teamA.length === 0 && teamB.length === 0) return 'Compose les deux équipes'
    if (teamA.length !== teamB.length) return 'Les deux équipes doivent avoir le même nombre de joueurs'
    if (teamA.length !== 2 && teamA.length !== 3) return 'Un match se joue en 2v2 ou 3v3'
    if (scoreA === '' || scoreB === '') return 'Renseigne les deux scores'
    if (Number.isNaN(sA) || Number.isNaN(sB)) return 'Scores invalides'
    if (Math.max(sA, sB) < 20 || Math.abs(sA - sB) < 2)
      return "Un match se termine à 20 pts avec 2 pts d'écart minimum"
    if (!date) return 'Sélectionne une date'
    return null
  }

  const invalidReason = validate()

  async function saveMatch(e) {
    e.preventDefault()
    setError('')

    const reason = validate()
    if (reason) {
      setError(reason)
      return
    }

    const now = new Date()
    const [y, m, d] = date.split('-').map(Number)
    const matchDate = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds())

    setSaving(true)
    try {
      await api.addMatch({
        teamA,
        teamB,
        scoreA: sA,
        scoreB: sB,
        date: matchDate.toISOString(),
      })
    } catch {
      setSaving(false)
      setError('Enregistrement impossible, réessaie')
      return
    }
    setSaving(false)

    setPresentIds([])
    setTeamA([])
    setTeamB([])
    setScoreA('')
    setScoreB('')
    showToast('Match enregistré !')
  }

  if (!players) {
    return <p className="text-slate-500 text-sm">Chargement…</p>
  }

  if (!players.length) {
    return (
      <p className="text-slate-500 text-sm">
        Ajoute d'abord des joueurs dans l'onglet "Réglages".
      </p>
    )
  }

  const presentPlayers = players.filter((p) => presentIds.includes(p.id))

  return (
    <form onSubmit={saveMatch} className="space-y-6">
      <h2 className="text-lg font-semibold">Nouveau match</h2>

      <div>
        <p className="text-sm text-slate-400 mb-2">Date</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">Joueurs présents</p>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => {
            const isPresent = presentIds.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePresent(p.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  isPresent
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {presentPlayers.length > 0 && (
        <div>
          <p className="text-sm text-slate-400 mb-2">
            Équipes <span className="text-slate-600">(2v2 ou 3v3, {teamA.length} – {teamB.length})</span>
          </p>
          <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
            {presentPlayers.map((p) => {
              const team = teamA.includes(p.id) ? 'A' : teamB.includes(p.id) ? 'B' : null
              const aFull = teamA.length >= 3 && team !== 'A'
              const bFull = teamB.length >= 3 && team !== 'B'
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-2.5 bg-slate-900/50"
                >
                  <span>{p.name}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={aFull}
                      onClick={() => assignTeam(p.id, 'A')}
                      className={`w-10 h-8 rounded-md text-sm font-semibold transition ${
                        team === 'A'
                          ? 'bg-sky-500 text-white'
                          : aFull
                            ? 'bg-slate-900 text-slate-700 cursor-not-allowed'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      disabled={bFull}
                      onClick={() => assignTeam(p.id, 'B')}
                      className={`w-10 h-8 rounded-md text-sm font-semibold transition ${
                        team === 'B'
                          ? 'bg-amber-500 text-white'
                          : bFull
                            ? 'bg-slate-900 text-slate-700 cursor-not-allowed'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      B
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-sky-400 mb-1">Équipe A</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            placeholder="0"
            className="w-24 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </div>
        <span className="text-slate-500 pb-2">–</span>
        <div>
          <label className="block text-xs font-medium text-amber-400 mb-1">Équipe B</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            placeholder="0"
            className="w-24 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving || !!invalidReason}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'Enregistrement…' : invalidReason ?? 'Enregistrer le résultat'}
      </button>
    </form>
  )
}
