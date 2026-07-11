from mongodb import database

database.create_user("user_001")

user = database.get_user("user_001")

print(user)