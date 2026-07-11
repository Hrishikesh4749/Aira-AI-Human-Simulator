from datetime import datetime
from pymongo import ReturnDocument

from mongodb import memories


def add_memory(
    user_id: str,
    text: str,
    embedding: list,
    importance: float = 1.0
):
    """
    Store a semantic memory.
    """

    existing = memories.find_one({
        "user_id": user_id,
        "text": text
    })

    if existing:
        return existing

    document = {

        "user_id": user_id,

        "text": text,

        "embedding": embedding,

        "importance": importance,

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow()
    }

    memories.insert_one(document)

    return document


def get_all_memories(user_id: str):

    return list(

        memories.find(
            {"user_id": user_id},
            {"_id": 0}

        )

    )


def get_memory_texts(user_id: str):

    docs = memories.find(
        {"user_id": user_id},
        {
            "_id": 0,
            "text": 1
        }
    )

    return [

        doc["text"]

        for doc in docs

    ]


def get_memory_embeddings(user_id: str):

    docs = memories.find(
        {"user_id": user_id},
        {
            "_id": 0,
            "embedding": 1
        }
    )

    return [

        doc["embedding"]

        for doc in docs

    ]


def update_importance(
    user_id: str,
    text: str,
    importance: float
):

    return memories.find_one_and_update(

        {
            "user_id": user_id,
            "text": text
        },

        {
            "$set": {

                "importance": importance,

                "updated_at": datetime.utcnow()

            }
        },

        return_document=ReturnDocument.AFTER,

        projection={"_id": 0}

    )


def delete_memory(
    user_id: str,
    text: str
):

    return memories.delete_one(

        {
            "user_id": user_id,
            "text": text
        }

    )


def memory_exists(
    user_id: str,
    text: str
):

    return memories.find_one({

        "user_id": user_id,

        "text": text

    }) is not None