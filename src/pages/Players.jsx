import { useState } from 'react'
import { useAsyncList } from '../useAsyncList'
import * as api from '../api'
import { useToast } from '../components/Toast'

export default function Players() {
  const showToast = useToast()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [players, refetch] = useAsyncList(api.listPlayers)

  async function addPlayer(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      await api.addPlayer(trimmed)
      setName('')
      showToast(`${trimmed} ajouté`)
      refetch()
    } catch {
      showToast('Ajout impossible', 'error')
    }
  }

  async function removePlayer(id, playerName) {
    if (!confirm(`Supprimer ${playerName} ? Ses matchs déjà joués resteront enregistrés.`)) return
    try {
      await api.deletePlayer(id)
      showToast(`${playerName} supprimé`, 'error')
      refetch()
    } catch {
      showToast('Suppression impossible', 'error')
    }
  }

  function startEdit(p) {
    setEditingId(p.id)
    setEditingName(p.name)
  }

  async function commitEdit() {
    const trimmed = editingName.trim()
    if (trimmed) {
      try {
        await api.updatePlayer(editingId, trimmed)
        showToast('Nom mis à jour')
        refetch()
      } catch {
        showToast('Mise à jour impossible', 'error')
      }
    }
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Joueurs</h2>

      <form onSubmit={addPlayer} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du joueur"
          className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium hover:bg-sky-400"
        >
          Ajouter
        </button>
      </form>

      <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
        {!players ? (
          <li className="px-4 py-6 text-center text-slate-500 text-sm">Chargement…</li>
        ) : players.length ? (
          players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between px-4 py-2.5 bg-slate-900/50"
            >
              {editingId === p.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 mr-3 rounded-md bg-slate-800 border border-sky-500 px-2 py-1 text-sm outline-none"
                />
              ) : (
                <button
                  onClick={() => startEdit(p)}
                  className="text-left flex-1 hover:text-sky-400"
                >
                  {p.name}
                </button>
              )}
              <button
                onClick={() => removePlayer(p.id, p.name)}
                className="text-slate-500 hover:text-red-400 text-sm shrink-0"
              >
                Supprimer
              </button>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-center text-slate-500 text-sm">
            Aucun joueur pour l'instant
          </li>
        )}
      </ul>
    </div>
  )
}
