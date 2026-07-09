import { useMemo, useState } from 'react'
import { useAsyncList } from '../useAsyncList'
import * as api from '../api'
import PlayerProfile from './PlayerProfile'
import { useToast } from '../components/Toast'

function computeStandings(players, matches, pointsConfig) {
  const stats = new Map(
    players.map((p) => [
      p.id,
      { id: p.id, name: p.name, wins: 0, losses: 0, played: 0, pointsFor: 0, pointsAgainst: 0, rankingPts: 0 },
    ]),
  )

  for (const m of matches) {
    const aWon = m.scoreA > m.scoreB
    const extended = Math.max(m.scoreA, m.scoreB) > 20
    const winPts = extended ? pointsConfig.winExtended : pointsConfig.winNormal
    const lossPts = extended ? pointsConfig.lossExtended : pointsConfig.lossNormal

    for (const id of m.teamA) {
      const s = stats.get(id)
      if (!s) continue
      s.played++
      if (aWon) s.wins++
      else s.losses++
      s.pointsFor += m.scoreA
      s.pointsAgainst += m.scoreB
      s.rankingPts += aWon ? winPts : lossPts
    }
    for (const id of m.teamB) {
      const s = stats.get(id)
      if (!s) continue
      s.played++
      if (aWon) s.losses++
      else s.wins++
      s.pointsFor += m.scoreB
      s.pointsAgainst += m.scoreA
      s.rankingPts += aWon ? lossPts : winPts
    }
  }

  return [...stats.values()]
    .map((s) => ({ ...s, diff: s.pointsFor - s.pointsAgainst }))
    .sort((a, b) => b.rankingPts - a.rankingPts || b.diff - a.diff || a.name.localeCompare(b.name))
}

function groupByDate(matches) {
  const groups = new Map()
  for (const m of matches) {
    const day = m.date.slice(0, 10)
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day).push(m)
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

function formatDate(day) {
  return new Date(day).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function TeamNames({ ids, playersById }) {
  return ids.map((id) => playersById.get(id)?.name ?? '?').join(' / ')
}

const MODES = [
  { key: 'all', label: 'Tous' },
  { key: 2, label: '2v2' },
  { key: 3, label: '3v3' },
]

function MatchEditor({ match, playersById, onClose, onSaved }) {
  const showToast = useToast()
  const [scoreA, setScoreA] = useState(String(match.scoreA))
  const [scoreB, setScoreB] = useState(String(match.scoreB))
  const [busy, setBusy] = useState(false)

  const sA = Number(scoreA)
  const sB = Number(scoreB)
  const invalid =
    scoreA === '' ||
    scoreB === '' ||
    Number.isNaN(sA) ||
    Number.isNaN(sB) ||
    Math.max(sA, sB) < 20 ||
    Math.abs(sA - sB) < 2

  async function save() {
    if (invalid) return
    setBusy(true)
    try {
      await api.updateMatch(match.id, { scoreA: sA, scoreB: sB })
      showToast('Match modifié')
      onSaved()
      onClose()
    } catch {
      showToast('Modification impossible', 'error')
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('Supprimer ce match ?')) return
    setBusy(true)
    try {
      await api.deleteMatch(match.id)
      showToast('Match supprimé', 'error')
      onSaved()
      onClose()
    } catch {
      showToast('Suppression impossible', 'error')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold">Modifier le match</h3>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex-1 text-sky-400">
            <TeamNames ids={match.teamA} playersById={playersById} />
          </span>
          <span className="text-slate-600">vs</span>
          <span className="flex-1 text-right text-amber-400">
            <TeamNames ids={match.teamB} playersById={playersById} />
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            className="w-20 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-center text-sm outline-none focus:border-sky-500"
          />
          <span className="text-slate-500">–</span>
          <input
            type="number"
            inputMode="numeric"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            className="w-20 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-center text-sm outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={remove}
            disabled={busy}
            className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 disabled:opacity-40"
          >
            Supprimer
          </button>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={busy || invalid}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium hover:bg-sky-400 disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Rankings({ canEdit = false }) {
  const [view, setView] = useState('general')
  const [mode, setMode] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [editingMatch, setEditingMatch] = useState(null)
  const [filterIds, setFilterIds] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [players] = useAsyncList(api.listPlayers)
  const [allMatches, refetchMatches] = useAsyncList(api.listMatches)
  const [pointsConfig] = useAsyncList(api.getPointsConfig)

  const playersById = useMemo(
    () => new Map((players ?? []).map((p) => [p.id, p])),
    [players],
  )

  const matches = useMemo(
    () =>
      mode === 'all'
        ? (allMatches ?? [])
        : (allMatches ?? []).filter((m) => m.teamA.length === mode),
    [allMatches, mode],
  )

  // Filtre interne : classement uniquement sur les joueurs sélectionnés,
  // en ne comptant que les matchs joués entre eux (tous les participants sélectionnés).
  const filterActive = filterIds.length >= 4

  const rankMatches = useMemo(() => {
    if (!filterActive) return matches
    const set = new Set(filterIds)
    return matches.filter(
      (m) => [...m.teamA, ...m.teamB].every((id) => set.has(id)),
    )
  }, [matches, filterIds, filterActive])

  const rankPlayers = useMemo(() => {
    if (!filterActive) return players ?? []
    const set = new Set(filterIds)
    return (players ?? []).filter((p) => set.has(p.id))
  }, [players, filterIds, filterActive])

  const standings = useMemo(
    () => (pointsConfig ? computeStandings(rankPlayers, rankMatches, pointsConfig) : []),
    [rankPlayers, rankMatches, pointsConfig],
  )

  function toggleFilter(id) {
    setFilterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const dayGroups = useMemo(() => groupByDate(matches), [matches])

  if (!players || !allMatches || !pointsConfig) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-slate-900/70" />
        ))}
      </div>
    )
  }

  if (selectedPlayer) {
    return (
      <PlayerProfile
        player={selectedPlayer}
        matches={allMatches}
        playersById={playersById}
        onBack={() => setSelectedPlayer(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Classement</h2>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-full p-1">
          <button
            onClick={() => setView('general')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              view === 'general' ? 'bg-sky-500 text-white' : 'text-slate-400'
            }`}
          >
            Général
          </button>
          <button
            onClick={() => setView('byDate')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              view === 'byDate' ? 'bg-sky-500 text-white' : 'text-slate-400'
            }`}
          >
            Par date
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-full p-1 w-fit">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              mode === m.key ? 'bg-amber-500 text-white' : 'text-slate-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {view === 'general' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm"
          >
            <span className="font-medium text-slate-300">
              Classement global
              {filterActive && (
                <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                  {filterIds.length} joueurs
                </span>
              )}
            </span>
            <span className="text-slate-500 text-xs">{filterOpen ? '▲' : '▼'}</span>
          </button>
          {filterOpen && (
            <div className="border-t border-slate-800 px-3 py-3 space-y-3">
              <p className="text-xs text-slate-500">
                Sélectionne au moins 4 joueurs. Le classement ne compte que les matchs
                joués entre eux.
              </p>
              <div className="flex flex-wrap gap-2">
                {players.map((p) => {
                  const on = filterIds.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleFilter(p.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition border ${
                        on
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {p.name}
                    </button>
                  )
                })}
              </div>
              {filterIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterIds([])}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'general' ? (
        standings.length ? (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm border-collapse whitespace-nowrap">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-800">
                  <th className="py-2 pr-2 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Joueur</th>
                  <th className="py-2 px-2 font-medium text-right">Pts</th>
                  <th className="py-2 px-2 font-medium text-right">M</th>
                  <th className="py-2 px-2 font-medium text-right">V</th>
                  <th className="py-2 px-2 font-medium text-right">D</th>
                  <th className="py-2 px-2 font-medium text-right">Score+</th>
                  <th className="py-2 px-2 font-medium text-right">Score-</th>
                  <th className="py-2 pl-2 font-medium text-right">Diff</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.id} className="border-b border-slate-900">
                    <td className="py-2 pr-2 text-slate-500">{i + 1}</td>
                    <td className="py-2 pr-3 font-medium">
                      <button
                        type="button"
                        onClick={() => setSelectedPlayer(playersById.get(s.id))}
                        className="hover:text-sky-400 hover:underline"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-sky-400">{s.rankingPts}</td>
                    <td className="py-2 px-2 text-right text-slate-500">{s.played}</td>
                    <td className="py-2 px-2 text-right text-emerald-400">{s.wins}</td>
                    <td className="py-2 px-2 text-right text-red-400">{s.losses}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{s.pointsFor}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{s.pointsAgainst}</td>
                    <td
                      className={`py-2 pl-2 text-right font-medium ${
                        s.diff > 0 ? 'text-emerald-400' : s.diff < 0 ? 'text-red-400' : 'text-slate-500'
                      }`}
                    >
                      {s.diff > 0 ? '+' : ''}
                      {s.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            {filterActive
              ? 'Aucun match joué entre ces joueurs.'
              : "Aucun match joué pour l'instant."}
          </p>
        )
      ) : dayGroups.length ? (
        <div className="space-y-5">
          {canEdit && (
            <p className="text-xs text-slate-600">Touche un match pour le modifier ou le supprimer.</p>
          )}
          {dayGroups.map(([day, dayMatches]) => (
            <div key={day}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                {formatDate(day)}
              </p>
              <div className="space-y-2">
                {dayMatches.map((m) => {
                  const aWon = m.scoreA > m.scoreB
                  const rowClass =
                    'w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm flex items-center justify-between gap-3 text-left'
                  const content = (
                    <>
                      <span className={aWon ? 'text-slate-100 font-medium' : 'text-slate-400'}>
                        <TeamNames ids={m.teamA} playersById={playersById} />
                      </span>
                      <span className="text-slate-500 font-mono text-xs whitespace-nowrap">
                        {m.scoreA} – {m.scoreB}
                      </span>
                      <span className={!aWon ? 'text-slate-100 font-medium' : 'text-slate-400'}>
                        <TeamNames ids={m.teamB} playersById={playersById} />
                      </span>
                    </>
                  )
                  return canEdit ? (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEditingMatch(m)}
                      className={`${rowClass} transition hover:border-slate-700 hover:bg-slate-900`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div key={m.id} className={rowClass}>
                      {content}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Aucun match joué pour l'instant.</p>
      )}

      {editingMatch && (
        <MatchEditor
          match={editingMatch}
          playersById={playersById}
          onClose={() => setEditingMatch(null)}
          onSaved={refetchMatches}
        />
      )}
    </div>
  )
}
