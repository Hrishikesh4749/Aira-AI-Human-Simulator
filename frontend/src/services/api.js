import axios from 'axios'

// The backend (main.py) exposes exactly two endpoints today:
//   POST /chat      body: { text: string }        -> { reply: string }
//   GET  /initiate                                  -> { reply: string }
// This client intentionally targets only what the backend actually implements.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
