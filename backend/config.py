import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    MONGODB_URI = os.getenv("MONGODB_URI")

    DATABASE_NAME = os.getenv("DATABASE_NAME")

    DEFAULT_USER_ID = os.getenv("DEFAULT_USER_ID", "user_001")


settings = Settings()