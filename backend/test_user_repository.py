from repositories.user_repository import *

USER_ID = "user_001"

create_user(USER_ID)

print(get_user(USER_ID))

update_profile(
    USER_ID,
    name="Hrishikesh",
    favorite_game="Valorant",
    favorite_color="Blue"
)

print(get_user(USER_ID))

update_relationship(
    USER_ID,
    trust=75,
    comfort=55
)

print(get_user(USER_ID))

update_emotion(
    USER_ID,
    mood="happy",
    affection=80
)

print(get_user(USER_ID))

update_personality(
    USER_ID,
    sarcasm=8,
    playfulness=9
)

print(get_user(USER_ID))