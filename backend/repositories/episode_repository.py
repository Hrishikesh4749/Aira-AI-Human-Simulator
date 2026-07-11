from datetime import datetime

from mongodb import episodes


def episode_exists(user_id: str, text: str) -> bool:

    return episodes.find_one({
        "user_id": user_id,
        "text": text
    }) is not None


def add_episode(
    user_id: str,
    text: str,
    embedding,
    importance: int = 1
):

    document = {

    "user_id": user_id,

    "text": text,

    "embedding": embedding,

    "importance": importance,

    "created_at": datetime.utcnow(),

    "updated_at": datetime.utcnow()
    }

    episodes.insert_one(document)

    return document


def get_recent_episodes(
    user_id: str,
    limit: int = 5
):

    return list(

        episodes.find(

            {
                "user_id": user_id
            },

            {
                "_id": 0
            }

        )

        .sort("created_at", -1)

        .limit(limit)

    )