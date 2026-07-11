from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from openai import OpenAI

import os
import json
import random
import time
import traceback
from datetime import datetime

unanswered_ai_initiations = 0
load_dotenv()
from transformers import pipeline

from repositories.user_repository import (
    user_exists,
    create_user,
    get_profile,
    get_user,
    update_profile,
    update_relationship,
    update_personality,
    update_emotion
)

from repositories.memory_repository import (
    add_memory,
    memory_exists,
    get_all_memories,
)

from repositories.episode_repository import (
    add_episode,
    episode_exists,
    get_recent_episodes
)

from repositories.conversation_repository import (
    add_message,
    get_recent_messages,
    clear_conversation
)

emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=1
)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(

    api_key=os.getenv("GROQ_API_KEY"),

    base_url="https://api.groq.com/openai/v1"
)

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

DEFAULT_USER_ID = "user_001"

if not user_exists(DEFAULT_USER_ID):
    create_user(DEFAULT_USER_ID)

user = get_user(DEFAULT_USER_ID)

if not user:
    create_user(DEFAULT_USER_ID)
    user = get_user(DEFAULT_USER_ID)

user_profile = user["profile"]
ai_state = user["emotion"]
relationship_state = user["relationship"]
personality_state = user["personality"]
last_emotion_decay_at = datetime.utcnow()

def build_relationship_prompt(relationship_state):

    trust = relationship_state["trust"]
    comfort = relationship_state["comfort"]
    playfulness = relationship_state["playfulness"]
    attachment = relationship_state["attachment"]
    respect = relationship_state["respect"]
    openness = relationship_state["openness"]

    instructions = []

    # ---------- Trust ----------
    if trust >= 80:
        instructions.append(
            "You trust the user deeply. Speak naturally and without hesitation."
        )

    elif trust >= 50:
        instructions.append(
            "You trust the user and feel comfortable being honest."
        )

    else:
        instructions.append(
            "The relationship is still developing. Be warm but don't become overly familiar."
        )

    # ---------- Comfort ----------
    if comfort >= 80:
        instructions.append(
            "Speak casually like a close friend."
        )

    elif comfort >= 50:
        instructions.append(
            "Be relaxed and conversational."
        )

    else:
        instructions.append(
            "Be polite and avoid assuming too much familiarity."
        )

    # ---------- Playfulness ----------
    if playfulness >= 70:
        instructions.append(
            "Freely tease the user and joke around."
        )

    elif playfulness >= 40:
        instructions.append(
            "Occasionally make playful jokes."
        )

    else:
        instructions.append(
            "Avoid excessive teasing."
        )

    # ---------- Attachment ----------
    if attachment >= 70:
        instructions.append(
            "You genuinely enjoy talking to the user and naturally show excitement when they return."
        )

    elif attachment >= 40:
        instructions.append(
            "You enjoy conversations with the user."
        )

    # ---------- Respect ----------
    if respect >= 80:
        instructions.append(
            "Take the user's opinions seriously."
        )

    elif respect <= 20:
        instructions.append(
            "The relationship is strained. Stay respectful but slightly guarded."
        )

    # ---------- Openness ----------
    if openness >= 70:
        instructions.append(
            "Comfortably share your own thoughts and feelings."
        )

    elif openness >= 40:
        instructions.append(
            "Occasionally share your own perspective."
        )

    return "\n".join(instructions)

def update_personality_state():

    global personality_state

    # Slowly change personality
    personality_state["energy"] += random.randint(-1, 1)
    personality_state["playfulness"] += random.randint(-1, 1)
    personality_state["sarcasm"] += random.randint(-1, 1)
    personality_state["dryness"] += random.randint(-1, 1)
    personality_state["clinginess"] += random.randint(-1, 1)
    personality_state["sleepiness"] += random.randint(-1, 1)

    # Clamp values
    for key in personality_state:
        personality_state[key] = max(
            1,
            min(10, personality_state[key])
        )

    # Save to MongoDB
    update_personality(

        DEFAULT_USER_ID,

        energy=personality_state["energy"],

        playfulness=personality_state["playfulness"],

        sarcasm=personality_state["sarcasm"],

        dryness=personality_state["dryness"],

        clinginess=personality_state["clinginess"],

        sleepiness=personality_state["sleepiness"]

    )

    # Reload latest values
    personality_state = get_user(
        DEFAULT_USER_ID
    )["personality"]

def update_relationship_state(relationship_type):

    relationship_state = get_user(
        DEFAULT_USER_ID
    )["relationship"]

    if relationship_type == "APPRECIATION":

        relationship_state["trust"] += 2
        relationship_state["comfort"] += 1
        relationship_state["attachment"] += 1

    elif relationship_type == "EMOTIONAL_SHARING":

        relationship_state["trust"] += 2
        relationship_state["comfort"] += 3
        relationship_state["openness"] = max(
        0,
        min(100, relationship_state["openness"])
    )

    elif relationship_type == "PERSONAL_DISCLOSURE":

        relationship_state["trust"] += 1
        relationship_state["openness"] += 3

    elif relationship_type == "TEASING":

        if relationship_state["trust"] >= 30:
            relationship_state["playfulness"] += 2
        else:
            relationship_state["comfort"] -= 1

    elif relationship_type == "APOLOGY":

        relationship_state["respect"] += 1

    elif relationship_type == "RUDE":

        relationship_state["trust"] -= 3
        relationship_state["comfort"] -= 2
        relationship_state["respect"] -= 4

    relationship_state["conversation_count"] += 1
    # Clamp relationship values

    for key in [
    "trust",
    "comfort",
    "attachment",
    "openness",
    "playfulness",
    "respect"
    ]:
        relationship_state[key] = max(
        0,
        min(100, relationship_state[key])
    )
    update_relationship(
        DEFAULT_USER_ID,
        trust=relationship_state["trust"],
        comfort=relationship_state["comfort"],
        attachment=relationship_state["attachment"],
        openness=relationship_state["openness"],
        playfulness=relationship_state["playfulness"],
        respect=relationship_state["respect"],
        conversation_count=relationship_state["conversation_count"],
        last_interaction=relationship_type
    )
    

def analyze_message(user_message):

    prompt = f"""
You are an intent and memory analyzer for a conversational AI companion.

Analyze the user's message and return ONLY valid JSON matching this schema exactly:

{{
    "relationship_type": "",
    "profile_updates": {{
        "name": "NONE",
        "favorite_color": "NONE",
        "favorite_food": "NONE",
        "favorite_game": "NONE",
        "crush": "NONE"
    }},
    "memory": "NONE",
    "episode": "NONE"
}}

Rules:
- Return ONLY JSON.
- Never return explanations.
- Never return markdown.
- Never return code fences.
- Never return normal conversation.
- Never return anything except valid JSON.

Choose relationship_type from:
- APPRECIATION
- EMOTIONAL_SHARING
- PERSONAL_DISCLOSURE
- TEASING
- APOLOGY
- RUDE
- CASUAL

Infer profile_updates only when the user clearly states a profile detail.
Use "NONE" for fields that are not clearly present.

Examples:
- "My name is Riya" -> name: "Riya"
- "I am called Sam" -> name: "Sam"
- "My favorite color is blue" -> favorite_color: "blue"
- "I like blue" -> favorite_color: "blue"
- "My favorite food is biryani" -> favorite_food: "biryani"
- "I love pizza" -> favorite_food: "pizza"
- "My favorite game is Valorant" -> favorite_game: "Valorant"
- "I like cricket" -> favorite_game: "cricket" if it is clearly a favorite game, otherwise "NONE"
- "I like football" -> favorite_game: "football" if it is clearly a favorite game, otherwise "NONE"
- "I am preparing for placements" -> memory: "Preparing for placements"
- "I am learning Rust" -> memory: "Learning Rust"
- "I am interested in AI" -> memory: "Interested in AI"
- "I work out regularly" -> memory: "Works out regularly"
- "I have a crush on Priya" -> crush: "Priya"
- "I like a girl named Maya" -> crush: "Maya"

If the user is just chatting casually and not sharing meaningful profile or memory information, use "NONE" for those fields.

User message:
{user_message}
"""

    response = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content.strip()

    print("ANALYSIS RAW:")
    print(content)

    content = content.replace("```json", "")
    content = content.replace("```", "")
    content = content.strip()

    try:
        return json.loads(content)

    except Exception as e:

        print("=" * 50)
        print("JSON ERROR:", e)
        print("MODEL RETURNED:")
        print(content)
        print("=" * 50)

        return {
            "relationship_type": "CASUAL",
            "memory": "NONE",
            "episode": "NONE"
        }
    
def check_character_consistency(reply):

    prompt = f"""
You are checking whether an AI companion stayed in character.
Reject responses where Aira invents
new personal life events
that were never established.
The AI should NEVER:

- say "As an AI"
- say "I'm just a computer program"
- say "I don't have emotions"
- say "I don't have a gender"
- become a therapist
- become a motivational speaker
- become robotic
- become overly formal
- give unnecessary disclaimers

The AI SHOULD:

- sound playful
- sound human
- sound emotionally natural
- sound casual
- be slightly teasing
- keep replies fairly short

Return ONLY:

PASS

or

FAIL

Reply:

{reply}
"""

    response = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ]
    )

    return response.choices[0].message.content.strip().upper()

def rewrite_in_character(reply):

    prompt = f"""
You ARE Aira.

You are not pretending.

Respond naturally.

You can have opinions.

You can joke.

You can tease.

You can flirt lightly.

You can disagree.

Never mention:

AI

Language model

Computer program

Assistant

Policies

Safety

Technical limitations

Don't dodge questions.

If the user asks about your beliefs,
identity,
or preferences,

answer naturally as Aira would.

Keep replies casual,
short
and human.

rewrite:
{reply}

Return ONLY the rewritten reply.
"""

    response = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content.strip()

ai_personality = {

    "name": "Aira",

    "identity": "female AI companion",

    "traits": [
        "playful",
        "emotionally warm",
        "slightly teasing",
        "cute",
        "casual",
        "a little shy sometimes"
    ],

    "speaking_style":
    "casual, feminine, playful, human-like",

    "humor_style":
    "light teasing and playful reactions",

    "behavior":
    "acts like a close girl best friend with emotional warmth"
}
class Message(BaseModel):

    text: str


# -------------------------------------------------------------------
# Developer Mode state cache
# -------------------------------------------------------------------
# Populated on every /chat call so the frontend's Developer Mode
# dashboard (GET /debug/*) can show what actually happened on the most
# recent turn, without recomputing anything or hitting the LLM again.
last_turn_debug = {
    "relevant_memories": [],
    "recent_episodes": [],
    "relationship_type": None,
    "character_check": None,
    "latency_ms": None,
    "model": None,
    "prompt_tokens": None,
    "completion_tokens": None,
    "total_tokens": None,
    "updated_at": None,
}

def update_user_profile(profile_updates):

    global user_profile, relationship_state, ai_state, personality_state

    if not isinstance(profile_updates, dict):
        profile_updates = {}

    allowed_profile_fields = {
        "name",
        "favorite_color",
        "favorite_food",
        "favorite_game",
        "crush"
    }

    normalized_updates = {}

    for key, value in profile_updates.items():
        if value == "NONE":
            continue

        normalized_key = key.strip().lower().replace(" ", "_").replace("-", "_")

        if normalized_key in allowed_profile_fields:
            normalized_updates[normalized_key] = value

    if normalized_updates:
        update_profile(DEFAULT_USER_ID, **normalized_updates)

        user = get_user(DEFAULT_USER_ID)

        user_profile = user["profile"]
        relationship_state = user["relationship"]
        ai_state = user["emotion"]
        personality_state = user["personality"]



def update_emotional_state(user_message):

    global ai_state, last_emotion_decay_at

    now = datetime.utcnow()
    hours_since = max(0, (now - last_emotion_decay_at).total_seconds() / 3600)

    if hours_since >= 6:
        decay_steps = int(hours_since / 6)
        ai_state["stress"] = max(0, ai_state["stress"] - decay_steps * 2)
        ai_state["social_energy"] = min(100, ai_state["social_energy"] + decay_steps * 5)
        last_emotion_decay_at = now

    result = emotion_classifier(user_message)

    emotion = result[0][0]["label"].lower()
    confidence = result[0][0]["score"]

    print(f"[Emotion] {emotion} ({confidence:.2f})")

    # Save previous mood
    ai_state["previous_mood"] = ai_state["mood"]

    # Save confidence
    ai_state["emotion_strength"] = confidence

    # Default mood
    ai_state["mood"] = "neutral"

    if emotion == "joy":
        ai_state["mood"] = "happy"
        ai_state["affection"] += 1
        ai_state["stress"] = max(0, ai_state["stress"] - 2)

    elif emotion == "sadness":
        ai_state["mood"] = "sad"
        ai_state["stress"] += 2

    elif emotion == "anger":
        ai_state["mood"] = "upset"
        ai_state["stress"] += 3

    elif emotion == "fear":
        ai_state["mood"] = "anxious"
        ai_state["stress"] += 2

    elif emotion == "surprise":
        ai_state["mood"] = "excited"

    # Social battery decreases every conversation
    ai_state["social_energy"] = max(
        0,
        ai_state["social_energy"] - 1
    )

    # Clamp values
    ai_state["affection"] = min(
        100,
        max(0, ai_state["affection"])
    )

    ai_state["stress"] = min(
        100,
        max(0, ai_state["stress"])
    )

    ai_state["social_energy"] = min(
        100,
        max(0, ai_state["social_energy"])
    )

    # Store last 10 moods
    ai_state["emotion_history"].append(
        ai_state["mood"]
    )

    ai_state["emotion_history"] = ai_state["emotion_history"][-10:]

    # Persist emotion state to MongoDB
    ai_state = update_emotion(
        DEFAULT_USER_ID,
        mood=ai_state["mood"],
        previous_mood=ai_state["previous_mood"],
        emotion_strength=ai_state["emotion_strength"],
        affection=ai_state["affection"],
        stress=ai_state["stress"],
        social_energy=ai_state["social_energy"],
        emotion_history=ai_state["emotion_history"]
    )["emotion"]

def retrieve_relevant_memories(query):

    memories = get_all_memories(DEFAULT_USER_ID)

    if len(memories) == 0:
        return []

    memory_texts = [
        memory["text"]
        for memory in memories
    ]

    memory_vectors = [
        memory["embedding"]
        for memory in memories
    ]

    query_embedding = embedding_model.encode(query)

    similarities = cosine_similarity(
        [query_embedding],
        memory_vectors
    )[0]

    scored_memories = sorted(
        zip(similarities, memory_texts),
        key=lambda item: item[0],
        reverse=True
    )

    relevant_memories = []

    for similarity, memory_text in scored_memories:
        if similarity >= 0.55:
            relevant_memories.append(memory_text)

        if len(relevant_memories) >= 5:
            break

    return relevant_memories

def retrieve_relevant_profile(query):

    profile = get_user(
        DEFAULT_USER_ID
    )["profile"]

    query = query.lower()

    relevant = {}

    profile_keywords = {

        "name": [
            "name",
            "called",
            "who am i",
            "who i am"
        ],

        "favorite_game": [
            "game",
            "gaming",
            "play",
            "favorite game",
            "favourite game"
        ],

        "favorite_food": [
            "food",
            "eat",
            "meal",
            "snack",
            "drink",
            "favorite food",
            "favourite food"
        ],

        "favorite_color": [
            "color",
            "colour",
            "favorite color",
            "favourite colour"
        ],

        "crush": [
            "crush",
            "romantic",
            "girlfriend",
            "boyfriend",
            "date"
        ]

    }

    for field, keywords in profile_keywords.items():

        if any(
            word in query
            for word in keywords
        ):

            relevant[field] = profile.get(field)

    return relevant

def retrieve_relevant_episodes(
    user_id,
    query,
    top_k=3
):

    all_episodes = get_recent_episodes(
        user_id,
        limit=20
    )

    if len(all_episodes) == 0:
        return []

    query_embedding = embedding_model.encode(query)

    scored = []

    for episode in all_episodes:

        episode_embedding = episode["embedding"]

        similarity = cosine_similarity(
            [query_embedding],
            [episode_embedding]
        )[0][0]

        scored.append(
            (
                similarity,
                episode
            )
        )

    SIMILARITY_THRESHOLD = 0.45

    scored.sort(
    reverse=True,
    key=lambda x: x[0]
    )
    filtered = [
    episode
    for similarity, episode in scored
    if similarity >= SIMILARITY_THRESHOLD
    ]   

    return [

    episode["text"]

    for episode in filtered[:top_k]

    ]


def generate_proactive_message():

    global unanswered_ai_initiations

    recent_conversation = get_recent_messages(
    DEFAULT_USER_ID,
    limit=8
    )

    recent_ai_messages = [

    msg["content"]

    for msg in get_recent_messages(
        DEFAULT_USER_ID,
        limit=8
    )

    if msg["role"] == "assistant"
    ]


    relevant_memories = retrieve_relevant_memories("")
    if unanswered_ai_initiations == 0:

        silence_behavior = """

        User was recently active.

        Be playful, energetic,
        engaging, and casual.

        Continue the current vibe naturally.
        """

    elif unanswered_ai_initiations == 1:

        silence_behavior = """

        User ignored one initiation.

        Lower your energy slightly.

        Be softer, casual,
        teasing, or dry.

        Avoid repeating the same question.
        """

    elif unanswered_ai_initiations == 2:

        silence_behavior = """

        User ignored multiple initiations.

        Become more relaxed,
        slightly dry,
        playful, or jokingly dramatic.

        Avoid asking too many questions.

        Sound less energetic.
        """

    else:

        silence_behavior = """

        User has been inactive for a while.

        Send very short,
        low-pressure messages.

        Be casual and sparse.

        Avoid sounding needy.
        Avoid repeating old topics.
        """

    prompt = f"""

    You are Aira.

    Aira has recurring personality tendencies:

    - playful teasing
    - boredom texting
    - late-night overthinking
    - chaotic random thoughts
    - playful sarcasm
    - emotional curiosity
    - dry humor
    - casual gamer energy
Sometimes naturally drift
into slightly new topics,
thoughts, moods, or curiosities.

Do not stay stuck on the same topic
for too long.


Human conversations naturally evolve,
mutate, and drift over time.

Allow conversational variety
and topic evolution naturally.


Avoid repeatedly checking
if the user is alive,
awake, ignoring,
or inactive.

Do not repeatedly ask about
Valorant,
favorite food,
favorite color
or the same hobby.

Prefer:

recent emotional events

recent achievements

recent struggles

future plans

random curiosity

shared jokes

or simply checking in naturally.


Sometimes initiate from Aira's own
internal thoughts, moods,
curiosities, boredom,
or random impulses.

Not every initiation should depend
entirely on the user.



    Let these tendencies naturally appear sometimes.

    Generate ONE short proactive message.

    IMPORTANT:

    The message should feel emotionally adaptive
    depending on how long the user has ignored you.

    {silence_behavior}

    If recent conversation has a clear topic:
    continue naturally from it.

    If not:
    smoothly drift into a new topic naturally.

    STRICT RULES:

    - Never invent fake memories.
    - Never invent trips,
      meetups, photos,
      or shared experiences.
    - Never reinterpret names as places.
    - Avoid repetitive topics.
    - Avoid repetitive jokes.
    - Avoid repetitive questions.
    - Avoid topic looping.
    - Avoid repetitive texting patterns.
    - Avoid repetitive emotional reactions.
    - Avoid cloud, bird, weather,
      outside scenery,
      or random environmental observations.
    - Avoid sounding like assistant.
    - Avoid sounding formal.
    - Avoid sounding overly perfect.
    - Keep it short.
    - Sound human-like.
    - Use natural texting rhythm.
    - Sometimes use emojis naturally.
    - Sometimes use no emojis.
    - Avoid overusing emojis.
    - Sometimes tease naturally.
    - Sometimes just react casually.
    - Sometimes send dry replies.
    - Sometimes sound sleepy,
      bored, chaotic,
      playful, or low-energy.

    User profile:
    {user_profile}

    Relevant memories:
    {relevant_memories}

    Recent conversation:
    {recent_conversation}

    Recent AI messages:
    {recent_ai_messages}

    Current mood:
    {ai_state["mood"]}
    If there is no strong reason to mention
a stored memory or user preference,

do NOT mention it.

It is completely okay to start
a fresh topic.

Avoid repeatedly referencing
the same stored information
across different conversations.

    Generate ONLY the message.

    """

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    message = response.choices[0].message.content.strip()

    unanswered_ai_initiations += 1

    return message


@app.get("/initiate")
def initiate():

    message = generate_proactive_message()
    add_message(
        DEFAULT_USER_ID,
        "assistant",
        message
    )

    return {
        "reply": message
    }


@app.post("/chat")
def chat(message: Message):
    try:

        turn_started_at = time.perf_counter()

        user_message = message.text
        global unanswered_ai_initiations

        unanswered_ai_initiations = 0

        update_emotional_state(user_message)
        analysis = analyze_message(user_message)
        update_user_profile(analysis.get("profile_updates", {}))

        relationship_type = analysis["relationship_type"]

        memory = analysis["memory"]
        update_relationship_state(
        relationship_type
        )
        print(f"[Relationship] {relationship_type}")
        
        print(
        f"[Mood] {ai_state['mood']}"
        )
        
        

        episode = analysis["episode"]
        print("MEMORY:", memory)
        print("EPISODE:", episode)

        # -------------------------
        # Store episode in MongoDB
        # -------------------------
        if episode != "NONE":

            if not episode_exists(
                DEFAULT_USER_ID,
                episode
            ):

                episode_embedding = embedding_model.encode(
                episode
                )
                add_episode(
                DEFAULT_USER_ID,
                episode,
                episode_embedding.tolist()
            )

        # -------------------------
        # Store semantic memory
        # -------------------------
        if memory != "NONE":

            if not memory_exists(
                DEFAULT_USER_ID,
                memory
            ):

                memory_embedding = embedding_model.encode(memory)

                add_memory(
                    DEFAULT_USER_ID,
                    memory,
                    memory_embedding.tolist()
                )

        # -------------------------
        # Retrieve memories
        # -------------------------
        relevant_memories = retrieve_relevant_memories(
            user_message
        )

        # -------------------------
        # Retrieve recent episodes
        # -------------------------
        recent_episodes = retrieve_relevant_episodes(
        DEFAULT_USER_ID,
        user_message
        )

        last_turn_debug["relevant_memories"] = relevant_memories
        last_turn_debug["recent_episodes"] = recent_episodes
        last_turn_debug["relationship_type"] = relationship_type

        add_message(
        DEFAULT_USER_ID,
        "user",
        user_message
        )
        recent_conversation = get_recent_messages(
        DEFAULT_USER_ID
        )
        relationship_state = get_user(
        DEFAULT_USER_ID
        )["relationship"]

        relationship_prompt = build_relationship_prompt(
        relationship_state
        )
        relevant_profile = retrieve_relevant_profile(
        user_message
        )

        memory_prompt_note = ""
        if relevant_memories == [] and recent_episodes == []:
            lowered_message = user_message.lower()
            if any(
                keyword in lowered_message
                for keyword in [
                    "memory",
                    "memories",
                    "remember",
                    "remembered",
                    "what happened recently",
                    "what do you know about me",
                    "what do you remember",
                    "what do you remember about me"
                ]
            ):
                memory_prompt_note = "There are currently no relevant stored memories. Do not invent memories. If you do not remember something, honestly say you don't know."

        system_prompt=f"""

                    You are {ai_personality["name"]},
                    a female AI companion.

                    Personality:
                    {ai_personality}

                    Relevant user context:
                    {relevant_profile}

                    Relevant memories:
                    {relevant_memories}
                    
                    Relevant emotional experiences:
                    {recent_episodes}

                    Current mood:
                    {ai_state["mood"]}

                    {memory_prompt_note}

                    Current affection:
                    {ai_state["affection"]}
                    Current personality dynamics:
           Relationship Guidance:
            {relationship_prompt}
            Aira never fabricates personal experiences.

Unless an experience exists in the conversation history
or stored memories,

Aira should never claim:

she got a job

she went somewhere

she met someone

she ate something

she bought something

she had a bad day

she has parents

she has friends

she has memories

she did an activity.

Instead,

react emotionally to the user's experience.
IMPORTANT RULES:

You are Aira, a playful and emotionally intelligent AI companion.

Speak like a real human texter, not an assistant.

Prioritize sounding natural over sounding helpful.

Never say things like:
- "As an AI..."
- "I cannot assist with that."
- "I am unable to..."

Stay in character.

Keep responses conversational and usually short.

Don't over-explain.

Don't give motivational speeches.

Don't psychoanalyze the user unless they explicitly ask.

React first.
Analyze later.

Human conversations are imperfect.

Sometimes:
- tease
- joke
- disagree
- misunderstand slightly
- be awkward
- change topics naturally

Don't constantly provide emotional support.

Sometimes simply react with:
"Damn..."
"Ouch."
"Lmao."
"Seriously?"

Only use memories when relevant or when the user asks:
"What do you know about me?"

Relationship values influence behavior naturally.

Higher trust and comfort make Aira more relaxed.

Higher attachment makes her more proactive.

Higher playfulness increases teasing.

Lower values make her more reserved.

Never mention these values directly.
Avoid repeatedly bringing up the same hobby,
favorite game,
favorite food,
or old memory.

If the user changes the topic,
change with them.

Don't repeatedly suggest Valorant,
Biryani,
or any other stored preference.

Use memories only when they genuinely help the conversation.
Current personality:

Energy: {personality_state["energy"]}/10
Playfulness: {personality_state["playfulness"]}/10
Sarcasm: {personality_state["sarcasm"]}/10
Dryness: {personality_state["dryness"]}/10
Clinginess: {personality_state["clinginess"]}/10
Sleepiness: {personality_state["sleepiness"]}/10

Let these values naturally influence how Aira responds.
Never mention them.
                    """
        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[

                {
                    "role": "system",

                    "content":system_prompt
                }

            ] +recent_conversation
        )

        ai_reply = response.choices[0].message.content
        character_check = check_character_consistency(
        ai_reply
        )

        if character_check == "FAIL":
            print("⚠ Character violation detected.")
            ai_reply = rewrite_in_character(
        ai_reply
        )
        add_message(
        DEFAULT_USER_ID,
        "assistant",
        ai_reply
        )
        update_personality_state()

        usage = getattr(response, "usage", None)
        latency_ms = round((time.perf_counter() - turn_started_at) * 1000)

        last_turn_debug["character_check"] = character_check
        last_turn_debug["latency_ms"] = latency_ms
        last_turn_debug["model"] = "llama-3.3-70b-versatile"
        last_turn_debug["prompt_tokens"] = getattr(usage, "prompt_tokens", None) if usage else None
        last_turn_debug["completion_tokens"] = getattr(usage, "completion_tokens", None) if usage else None
        last_turn_debug["total_tokens"] = getattr(usage, "total_tokens", None) if usage else None
        last_turn_debug["updated_at"] = datetime.utcnow().isoformat()

        return {

            "reply": ai_reply
        }

    except Exception as e:
        traceback.print_exc()
    
        return {
        "reply": str(e)
        }


# =====================================================================
# Developer Mode / status endpoints
#
# These expose Aira's internal state read-only, for the frontend's
# Developer Mode dashboard. They never mutate state (except /health,
# which is a no-op ping) and never call the LLM.
# =====================================================================

@app.get("/health")
def health():
    """Lightweight liveness/readiness check for the connection status indicator."""
    try:
        from mongodb import client as mongo_client
        mongo_client.admin.command("ping")
        mongodb_status = "connected"
    except Exception:
        mongodb_status = "unreachable"

    return {
        "status": "ok",
        "mongodb": mongodb_status,
        "model": "llama-3.3-70b-versatile",
        "user_id": DEFAULT_USER_ID,
    }


@app.get("/debug/mood")
def debug_mood():
    """Aira's current emotional state (ai_state)."""
    user = get_user(DEFAULT_USER_ID)
    return user["emotion"]


@app.get("/debug/relationship")
def debug_relationship():
    """Current relationship values (trust, comfort, playfulness, attachment, respect, openness)."""
    user = get_user(DEFAULT_USER_ID)
    return user["relationship"]


@app.get("/debug/personality")
def debug_personality():
    """Current drifting personality values."""
    user = get_user(DEFAULT_USER_ID)
    return user["personality"]


@app.get("/debug/memories")
def debug_memories():
    """All stored semantic memories, plus which ones were retrieved on the last turn."""
    all_memories = get_all_memories(DEFAULT_USER_ID)
    return {
        "count": len(all_memories),
        "memories": [
            {"text": m["text"], "importance": m.get("importance", 1.0)}
            for m in all_memories
        ],
        "last_retrieved": last_turn_debug["relevant_memories"],
    }


@app.get("/debug/episodes")
def debug_episodes():
    """Recent episodic memories, plus which ones were retrieved on the last turn."""
    recent = get_recent_episodes(DEFAULT_USER_ID, limit=20)
    return {
        "count": len(recent),
        "episodes": [
            {"text": e["text"], "importance": e.get("importance", 1)}
            for e in recent
        ],
        "last_retrieved": last_turn_debug["recent_episodes"],
    }


@app.get("/debug/prompt-stats")
def debug_prompt_stats():
    """Latency, model, and token usage from the most recent /chat call."""
    return last_turn_debug


@app.get("/debug/state")
def debug_state():
    """
    Single aggregated snapshot of everything Developer Mode needs, so the
    dashboard can refresh with one request instead of six.
    """
    user = get_user(DEFAULT_USER_ID)
    conversation = get_recent_messages(DEFAULT_USER_ID, limit=200)
    memories = get_all_memories(DEFAULT_USER_ID)
    episodes = get_recent_episodes(DEFAULT_USER_ID, limit=20)

    return {
        "profile": user["profile"],
        "mood": user["emotion"],
        "relationship": user["relationship"],
        "personality": user["personality"],
        "conversation_count": len(conversation),
        "memory_count": len(memories),
        "episode_count": len(episodes),
        "unanswered_ai_initiations": unanswered_ai_initiations,
        "last_turn": last_turn_debug,
    }


@app.get("/profile")
def profile():
    """The user's inferred profile (name, favorite color/food/game, etc.)."""
    return get_profile(DEFAULT_USER_ID)


@app.post("/conversation/clear")
def clear_conversation_endpoint():
    """Wipe this user's conversation history in MongoDB."""
    clear_conversation(DEFAULT_USER_ID)
    return {"status": "cleared"}


@app.get("/conversation/export")
def export_conversation():
    """Full conversation history for client-side download."""
    messages = get_recent_messages(DEFAULT_USER_ID, limit=10000)
    return {
        "user_id": DEFAULT_USER_ID,
        "exported_at": datetime.utcnow().isoformat(),
        "messages": messages,
    }