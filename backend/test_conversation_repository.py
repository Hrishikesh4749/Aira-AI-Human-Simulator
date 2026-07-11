from repositories.conversation_repository import *

add_message(
    "user_001",
    "user",
    "Hello Aira!"
)

add_message(
    "user_001",
    "assistant",
    "Hey Hrishikesh!"
)

messages = get_recent_messages(
    "user_001"
)

print(messages)