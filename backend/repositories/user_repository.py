from datetime import datetime
from pymongo import ReturnDocument

from mongodb import users


def user_exists(user_id: str) -> bool:
    """
    Returns True if the user exists.
    """

    return users.find_one({"user_id": user_id}) is not None


def create_user(user_id: str):

    existing = users.find_one({"user_id": user_id})

    if existing:
        return existing

    document = {

        "user_id": user_id,

        "profile": {
            "name": "",
            "favorite_color": "",
            "favorite_food": "",
            "favorite_game": "",
            "crush": ""
        },

        "relationship": {
        "trust": 0,

        "comfort": 0,

        "playfulness": 5,

        "openness": 0,

        "attachment": 0,

        "respect": 50,

        "conversation_count": 0,

        "last_interaction": None
        },

        "emotion": {
         "mood": "neutral",

         "previous_mood": "neutral",

         "emotion_strength": 0.0,

            "affection": 0,

            "stress": 0,

         "social_energy": 100,

         "emotion_history": []
        },

        "personality": {
            "energy": 6,
            "playfulness": 7,
            "sarcasm": 4,
            "dryness": 3,
            "clinginess": 2,
            "sleepiness": 2
        },

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    users.insert_one(document)

    return document


def get_user(user_id: str):

    return users.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )


def update_profile(user_id: str, **updates):

    mongo_updates = {}

    for key, value in updates.items():
        mongo_updates[f"profile.{key}"] = value

    mongo_updates["updated_at"] = datetime.utcnow()

    return users.find_one_and_update(

        {"user_id": user_id},

        {
            "$set": mongo_updates
        },

        return_document=ReturnDocument.AFTER,

        projection={"_id": 0}

    )


def update_relationship(user_id: str, **updates):

    mongo_updates = {}

    for key, value in updates.items():
        mongo_updates[f"relationship.{key}"] = value

    mongo_updates["updated_at"] = datetime.utcnow()

    return users.find_one_and_update(

        {"user_id": user_id},

        {
            "$set": mongo_updates
        },

        return_document=ReturnDocument.AFTER,

        projection={"_id": 0}

    )


def update_emotion(user_id: str, **updates):

    mongo_updates = {}

    for key, value in updates.items():
        mongo_updates[f"emotion.{key}"] = value

    mongo_updates["updated_at"] = datetime.utcnow()

    return users.find_one_and_update(

        {"user_id": user_id},

        {
            "$set": mongo_updates
        },

        return_document=ReturnDocument.AFTER,

        projection={"_id": 0}

    )
def get_profile(user_id: str):

    user = users.find_one(
        {"user_id": user_id},
        {"profile": 1, "_id": 0}
    )

    if user:
        return user["profile"]

    return None


def update_personality(user_id: str, **updates):

    mongo_updates = {}

    for key, value in updates.items():
        mongo_updates[f"personality.{key}"] = value

    mongo_updates["updated_at"] = datetime.utcnow()

    return users.find_one_and_update(

        {"user_id": user_id},

        {
            "$set": mongo_updates
        },

        return_document=ReturnDocument.AFTER,

        projection={"_id": 0}

    )