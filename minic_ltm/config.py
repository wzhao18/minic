import os

MONGO_HOST = os.environ.get("MONGO_HOST", "localhost")
MONGO_URL = "mongodb://" + MONGO_HOST
MONGO_PORT = int(os.environ.get("MONGO_PORT", 27017))
MONGO_ADMIN_USERNAME = os.environ.get("MONGO_ADMIN_USERNAME", "mongo")
MONGO_ADMIN_PASSWORD = os.environ.get("MONGO_ADMIN_PASSWORD", "mongo")