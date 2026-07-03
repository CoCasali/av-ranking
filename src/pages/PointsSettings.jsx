import { useEffect, useState } from 'react'
import { DEFAULT_POINTS_CONFIG, getPointsConfig, setPointsConfig } from '../api'
import { useToast } from '../components/Toast'

const FIELDS = [
  { key: 'winNormal', label: 'Victoire (match à 20 pts)' },
  { key: 'lossNormal', label: 'Défaite (match à 20 pts)' },
  { key: 'winExtended', label: "Victoire (match prolongé, >20 pts)" },
  { key: 'lossExtended', label: "Défaite (match prolongé, >20 pts)" },
]

export default function PointsSettings() {
  const showToast = useToast()
  const [config, setConfig] = useState(null)

  useEffect(() => {
    getPointsConfig().then(setConfig)
  }, [])

  function updateField(key, value) {
    setConfig({ ...config, [key]: Number(value) })
  }

  async function commitField() {
    await setPointsConfig(config)
    showToast('Barème mis à jour')
  }

  if (!config) return <p className="text-slate-500 text-sm">Chargement…</p>

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Système de points</h2>
      <p className="text-sm text-slate-500">
        Un match "prolongé" est un match où le score gagnant dépasse 20 (ex: 22-20), suite à la
        règle des 2 points d'écart.
      </p>

      <div className="space-y-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex items-center justify-between gap-3">
            <label className="text-sm text-slate-300">{f.label}</label>
            <input
              type="number"
              value={config[f.key]}
              onChange={(e) => updateField(f.key, e.target.value)}
              onBlur={commitField}
              className="w-20 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-right outline-none focus:border-sky-500"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={async () => {
          setConfig(DEFAULT_POINTS_CONFIG)
          await setPointsConfig(DEFAULT_POINTS_CONFIG)
          showToast('Valeurs par défaut restaurées')
        }}
        className="text-sm text-slate-500 hover:text-slate-300"
      >
        Réinitialiser aux valeurs par défaut (3 / 0 / 2 / 1)
      </button>
    </div>
  )
}
