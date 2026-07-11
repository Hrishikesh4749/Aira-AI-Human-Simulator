from sentence_transformers import SentenceTransformer

from repositories.memory_repository import *

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

USER_ID = "user_001"

memory = "User enjoys playing Fortnite."

embedding = model.encode(memory).tolist()

add_memory(
    USER_ID,
    memory,
    embedding
)

print(get_all_memories(USER_ID))

print(get_memory_texts(USER_ID))

print(len(get_memory_embeddings(USER_ID)))

update_importance(
    USER_ID,
    memory,
    4.5
)

print(get_all_memories(USER_ID))