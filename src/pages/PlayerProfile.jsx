import { useMemo } from 'react'

function pct(wins, played) {
  return played ? Math.round((wins / played) * 100) : 0
}

function computeProfile(playerId, matches, playersById) {
  let played = 0
  let wins = 0
  let losses = 0
  let pointsFor = 0
  let pointsAgainst = 0
  const opponents = new Map()
  const teammates = new Map()

  const involved = matches
    .filter((m) => m.teamA.includes(playerId) || m.teamB.includes(playerId))
    .sort((a, b) => a.date.localeCompare(b.date))

  for (const m of involved) {
    const onA = m.teamA.includes(playerId)
    const myTeam = onA ? m.teamA : m.teamB
    const otherTeam = onA ? m.teamB : m.teamA
    const myScore = onA ? m.scoreA : m.scoreB
    const otherScore = onA ? m.scoreB : m.scoreA
    const won = myScore > otherScore

    played++
    if (won) wins++
    else losses++
    pointsFor += myScore
    pointsAgainst += otherScore

    for (const oppId of otherTeam) {
      if (!opponents.has(oppId)) opponents.set(oppId, { id: oppId, played: 0, wins: 0 })
      const o = opponents.get(oppId)
      o.played++
      if (won) o.wins++
    }
    for (const mateId of myTeam) {
      if (mateId === playerId) continue
      if (!teammates.has(mateId)) teammates.set(mateId, { id: mateId, played: 0, wins: 0 })
      const t = teammates.get(mateId)
      t.played++
      if (won) t.wins++
    }
  }

  let streak = 0
  let streakType = null
  for (let i = involved.length - 1; i >= 0; i--) {
    const m = involved[i]
    const onA = m.teamA.includes(playerId)
    const won = onA ? m.scoreA > m.scoreB : m.scoreB > m.scoreA
    const type = won ? 'W' : 'L'
    if (streakType === null) streakType = type
    if (type !== streakType) break
    streak++
  }

  const toRows = (map) =>
    [...map.values()]
      .map((r) => ({ ...r, name: playersById.get(r.id)?.name ?? '?', winPct: pct(r.wins, r.played) }))
      .sort((a, b) => b.winPct - a.winPct || b.played - a.played || a.name.localeCompare(b.name))

  return {
    played,
    wins,
    losses,
    winPct: pct(wins, played),
    pointsFor,
    pointsAgainst,
    diff: pointsFor - pointsAgainst,
    streak,
    streakType,
    opponents: toRows(opponents),
    teammates: toRows(teammates),
  }
}

function StatRow({ label, rows, emptyLabel }) {
  if (!rows.length) return <p className="text-slate-500 text-sm">{emptyLabel}</p>

  const best = rows[0]
  const worst = rows[rows.length - 1]

  return (
    <div className="space-y-3">
      {rows.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-emerald-900 bg-emerald-950/30 px-3 py-2">
            <p className="text-xs text-emerald-500 mb-0.5">Meilleur {label}</p>
            <p className="text-sm font-medium">{best.name}</p>
            <p className="text-xs text-slate-500">{best.winPct}% ({best.wins}/{best.played})</p>
          </div>
          <div className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2">
            <p className="text-xs text-red-500 mb-0.5">Pire {label}</p>
            <p className="text-sm font-medium">{worst.name}</p>
            <p className="text-xs text-slate-500">{worst.winPct}% ({worst.wins}/{worst.played})</p>
          </div>
        </div>
      )}

      <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between px-4 py-2 bg-slate-900/50 text-sm">
            <span>{r.name}</span>
            <span className="text-slate-500">
              {r.winPct}% <span className="text-slate-600">({r.wins}/{r.played})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PlayerProfile({ player, matches, playersById, onBack }) {
  const p = useMemo(
    () => computeProfile(player.id, matches, playersById),
    [player.id, matches, playersById],
  )

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-sm text-slate-400 hover:text-slate-100 flex items-center gap-1"
      >
        ← Classement
      </button>

      <div>
        <h2 className="text-lg font-semibold">{player.name}</h2>
        {p.streak > 0 && (
          <p className={`text-sm ${p.streakType === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>
            {p.streak} {p.streakType === 'W' ? 'victoire' : 'défaite'}
            {p.streak > 1 ? 's' : ''} d'affilée
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 py-3">
          <p className="text-xl font-semibold">{p.played}</p>
          <p className="text-xs text-slate-500">Matchs</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 py-3">
          <p className="text-xl font-semibold text-sky-400">{p.winPct}%</p>
          <p className="text-xs text-slate-500">{p.wins}V / {p.losses}D</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 py-3">
          <p className={`text-xl font-semibold ${p.diff > 0 ? 'text-emerald-400' : p.diff < 0 ? 'text-red-400' : ''}`}>
            {p.diff > 0 ? '+' : ''}
            {p.diff}
          </p>
          <p className="text-xs text-slate-500">Diff. points</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-2">Contre chaque adversaire</h3>
        <StatRow label="adversaire" rows={p.opponents} emptyLabel="Pas encore de match." />
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-2">Avec chaque coéquipier</h3>
        <StatRow label="coéquipier" rows={p.teammates} emptyLabel="Pas encore joué en équipe." />
      </div>
    </div>
  )
}
