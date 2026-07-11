import api from './api'

/**
 * Send a user message to Aira.
 * Backend: POST /chat  ->  Message(BaseModel) { text: str }
 * Response shape (exactly as returned by main.py): { reply: string }
 */
export async function sendMessage(text) {
  const { data } = await api.post('/chat', { text })
  return data.reply
}

/**
 * Ask Aira to proactively initiate a message (used for idle nudges).
 * Backend: GET /initiate -> { reply: string }
 */
export async function initiateMessage() {
  const { data } = await api.get('/initiate')
  return data.reply
}

/**
 * Wipe the conversation Aira has persisted in MongoDB for this user.
 * Backend: POST /conversation/clear -> { status: "cleared" }
 */
export async function clearRemoteConversation() {
  const { data } = await api.post('/conversation/clear')
  return data
}

/**
 * Fetch the full persisted conversation for export.
 * Backend: GET /conversation/export -> { user_id, exported_at, messages: [] }
 */
export async function exportConversation() {
  const { data } = await api.get('/conversation/export')
  return data
}
