from datetime import datetime

from mongodb import conversations


def add_message(
    user_id: str,
    role: str,
    content: str
):

    document = {

        "user_id": user_id,

        "role": role,

        "content": content,

        "created_at": datetime.utcnow()

    }

    conversations.insert_one(document)

    return document


def get_recent_messages(
    user_id: str,
    limit: int = 12
):

    messages = list(

        conversations.find(

            {
                "user_id": user_id
            },

            {
                "_id": 0,
                "role": 1,
                "content": 1
            }

        )

        .sort("created_at", -1)

        .limit(limit)

    )

    messages.reverse()

    return messages


def clear_conversation(user_id: str):

    conversations.delete_many(

        {
            "user_id": user_id
        }

    )