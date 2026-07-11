from pymongo import MongoClient
from config import settings

client = MongoClient(settings.MONGODB_URI)

client.admin.command("ping")

print("✅ Connected to MongoDB Atlas!")

db = client[settings.DATABASE_NAME]

users = db["users"]
memories = db["memories"]
episodes = db["episodes"]
conversations = db["conversations"]