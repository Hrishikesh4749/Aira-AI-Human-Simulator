# Aira-AI-Human-Simulator

#  Aira — Human AI Simulator

> **A Human AI Simulator designed to feel like a real person rather than a traditional chatbot.**

Aira is an emotionally adaptive AI companion that maintains long-term memories, evolving relationships, personality drift, and proactive conversations to simulate human-like interactions.

---

## ✨ Features

### 🧠 Human-like Memory
- Semantic Memory (long-term facts about the user)
- Episodic Memory (important life events)
- Vector-based memory retrieval using Sentence Transformers
- MongoDB persistence

### ❤️ Relationship Engine
- Dynamic Trust
- Comfort
- Playfulness
- Attachment
- Respect
- Openness

Relationship values evolve naturally based on conversations.

---

### 😊 Emotion Engine

Detects user emotions and updates Aira's internal emotional state.

Supported emotions include:

- Happy
- Sad
- Angry
- Fear
- Surprise
- Neutral

---

### 🎭 Personality Drift

Instead of remaining static, Aira's personality changes over time.

Current personality dimensions include:

- Energy
- Playfulness
- Sarcasm
- Dryness
- Clinginess
- Sleepiness

---

### 💬 Natural Conversations

Unlike traditional assistants, Aira:

- remembers past conversations
- jokes naturally
- teases occasionally
- changes topics naturally
- avoids repetitive responses
- reacts emotionally

---

### 🚀 Proactive AI

Aira doesn't always wait for the user.

She can:

- start conversations
- check in after inactivity
- reference previous emotional moments
- ask about goals
- continue previous discussions

---

### 🛡 Character Preservation

A dedicated rewrite layer prevents Aira from breaking character.

She avoids responses like:

- "As an AI..."
- "I cannot..."
- robotic assistant-style replies

and instead maintains a consistent personality.

---

## 🏗 Architecture

                                    USER
                                      │
                                      │
                         React + Vite Frontend
                                      │
      ┌───────────────────────────────┼──────────────────────────────┐
      │                               │                              │
      │                               │                              │
 Landing Page                   Chat Interface                Developer Dashboard
      │                               │                              │
      └───────────────────────────────┼──────────────────────────────┘
                                      │
                               React Context API
                                      │
                             Axios HTTP Client
                                      │
                                      ▼
                        FastAPI Backend (main.py)
                                      │
      ┌───────────────────────────────┼───────────────────────────────────────┐
      │                               │                                       │
      │                               │                                       │
 POST /chat                  GET /initiate                          Debug APIs
      │                               │                                       │
      └───────────────────────────────┼───────────────────────────────────────┘
                                      │
                                      ▼
                           Chat Processing Pipeline
                                      │
     ┌────────────────────────────────┼─────────────────────────────────┐
     │                                │                                 │
     ▼                                ▼                                 ▼
Emotion Engine                Relationship Engine             Personality Engine
     │                                │                                 │
Detect User Emotion         Update Trust / Comfort      Personality Drift
Blend AI Mood               Playfulness / Openness      Energy / Sarcasm
Affection Update            Attachment / Respect        Dryness / Sleepiness
     │                                │                                 │
     └────────────────────────────────┼─────────────────────────────────┘
                                      │
                                      ▼
                           Memory Processing Layer
                                      │
          ┌───────────────────────────┼─────────────────────────────┐
          │                           │                             │
          ▼                           ▼                             ▼
 Semantic Memory              Episodic Memory              User Profile
(Long-term Facts)         (Important Experiences)      Preferences & Goals
          │                           │                             │
          └───────────────────────────┼─────────────────────────────┘
                                      │
                                      ▼
                         Sentence Transformer Embeddings
                                      │
                        all-MiniLM-L6-v2 Embedding Model
                                      │
                                      ▼
                          Vector Similarity Retrieval
                             (Cosine Similarity)
                                      │
         Retrieve Relevant Memories + Relevant Episodes + User Context
                                      │
                                      ▼
                            Prompt Construction Layer
                                      │
      ┌───────────────────────────────┼──────────────────────────────┐
      │                               │                              │
      ▼                               ▼                              ▼
 Relationship Prompt         Personality Prompt            Memory Context
      │                               │                              │
      └───────────────────────────────┼──────────────────────────────┘
                                      │
                                      ▼
                             Final System Prompt
                                      │
                                      ▼
                             Large Language Model
                     (Groq Llama / NVIDIA Models Supported)
                                      │
                                      ▼
                         Character Preservation Layer
                                      │
                     Rewrite Responses if Character Breaks
                                      │
                                      ▼
                            Final AI Response (Aira)
                                      │
                                      ▼
                        Conversation Storage (MongoDB)
                                      │
      ┌───────────────────────────────┼────────────────────────────────┐
      │                               │                                │
      ▼                               ▼                                ▼
 Conversation History          Semantic Memories            Episodic Memories
      │                               │                                │
      └───────────────────────────────┼────────────────────────────────┘
                                      │
                                      ▼
                           MongoDB Atlas Database

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- Axios

### Backend
- FastAPI
- Python

### Database
- MongoDB Atlas

### AI Models
- Groq LLMs
- NVIDIA-hosted models (supported)
- Sentence Transformers
- Emotion Classification Model

---

## 📂 Project Structure

```
Aira-Human-AI-Simulator/

frontend/
├── src/
├── components/
├── pages/
├── services/
├── hooks/

backend/
├── main.py
├── repositories/
├── models/
├── requirements.txt

README.md
```

---

## 🚀 Installation

### Clone

```bash
git clone https://github.com/Hrishikesh4749/Aira-AI-Human-Simulator.git

cd Aira-AI-Human-Simulator
```

---

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

## 📸 Screenshots

> Add screenshots here after deployment.

- Landing Page
- Chat Interface
- Developer Dashboard
- Settings
- Mobile View

---

## 🎯 Future Improvements

- Voice Conversations
- Image Understanding
- Local LLM Support
- Streaming Responses
- Group Conversations
- Calendar Awareness
- Multi-user Support
- Fine-tuned Personality Models

---

## 👨‍💻 Author

**Hrishikesh Chakravartula**

GitHub:
https://github.com/Hrishikesh4749

---

## ⭐ Project Vision

Most AI assistants are designed to answer questions.

Aira is designed to simulate a human relationship.

The goal is not to build another chatbot, but to explore how memory, emotions, evolving relationships, and personality can make AI interactions feel more natural and human.
