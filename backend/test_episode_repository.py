from repositories.episode_repository import *

add_episode(
    "user_001",
    "User was happy after winning a Valorant match."
)

episodes = get_recent_episodes("user_001")

print(episodes)