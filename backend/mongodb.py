from pymongo import MongoClient
from config import settings

client = MongoClient(settings.MONGODB_URI)

try:
    client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

db = client[settings.DATABASE_NAME]

users = db["users"]
memories = db["memories"]
episodes = db["episodes"]
conversations = db["conversations"]