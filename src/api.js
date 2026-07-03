import { supabase } from './supabaseClient'

export const DEFAULT_POINTS_CONFIG = {
  winNormal: 3,
  lossNormal: 0,
  winExtended: 2,
  lossExtended: 1,
}

export async function listPlayers() {
  const { data, error } = await supabase.from('players').select('*').order('name')
  if (error) throw error
  return data
}

export async function addPlayer(name) {
  const { error } = await supabase.from('players').insert({ name })
  if (error) throw error
}

export async function updatePlayer(id, name) {
  const { error } = await supabase.from('players').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deletePlayer(id) {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

function fromRow(m) {
  return {
    id: m.id,
    teamA: m.team_a,
    teamB: m.team_b,
    scoreA: m.score_a,
    scoreB: m.score_b,
    date: m.match_date,
  }
}

export async function listMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })
  if (error) throw error
  return data.map(fromRow)
}

export async function addMatch({ teamA, teamB, scoreA, scoreB, date }) {
  const { error } = await supabase.from('matches').insert({
    team_a: teamA,
    team_b: teamB,
    score_a: scoreA,
    score_b: scoreB,
    match_date: date,
  })
  if (error) throw error
}

export async function updateMatch(id, { scoreA, scoreB }) {
  const { error } = await supabase
    .from('matches')
    .update({ score_a: scoreA, score_b: scoreB })
    .eq('id', id)
  if (error) throw error
}

export async function deleteMatch(id) {
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}

export async function getPointsConfig() {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'points')
    .maybeSingle()
  if (error) throw error
  return data ? { ...DEFAULT_POINTS_CONFIG, ...data.value } : DEFAULT_POINTS_CONFIG
}

export async function setPointsConfig(value) {
  const { error } = await supabase.from('settings').upsert({ key: 'points', value })
  if (error) throw error
}
