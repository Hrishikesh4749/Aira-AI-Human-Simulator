import api from './api'

// Developer Mode surfaces: current mood, relationship state, personality
// state, retrieved memories/episodes, and prompt statistics.
//
// These now map to real backend endpoints exposed in main.py. Each
// function fails soft (returns null) so a single unreachable endpoint
// never breaks the whole dashboard.

async function safeGet(path) {
  try {
    const { data } = await api.get(path)
    return data
  } catch {
    return null
  }
}

// GET /debug/mood -> ai_state (mood, affection, stress, social_energy, emotion_history)
export async function getMoodState() {
  return safeGet('/debug/mood')
}

// GET /debug/relationship -> relationship_state (trust, comfort, playfulness, attachment, respect, openness)
export async function getRelationshipState() {
  return safeGet('/debug/relationship')
}

// GET /debug/personality -> personality_state (energy, playfulness, sarcasm, dryness, clinginess, sleepiness)
export async function getPersonalityState() {
  return safeGet('/debug/personality')
}

// GET /debug/memories -> { count, memories[], last_retrieved[] }
export async function getRetrievedMemories() {
  return safeGet('/debug/memories')
}

// GET /debug/episodes -> { count, episodes[], last_retrieved[] }
export async function getRetrievedEpisodes() {
  return safeGet('/debug/episodes')
}

// GET /debug/prompt-stats -> latency_ms, model, token counts for the last /chat turn
export async function getPromptStats() {
  return safeGet('/debug/prompt-stats')
}

// GET /debug/state -> single aggregated snapshot of everything above, plus
// profile + conversation/memory/episode counts. Used for cheap polling.
export async function getAiraState() {
  return safeGet('/debug/state')
}

// GET /profile -> the user's inferred profile
export async function getUserProfile() {
  return safeGet('/profile')
}

// GET /health -> { status, mongodb, model, user_id }
export async function getHealth() {
  return safeGet('/health')
}
