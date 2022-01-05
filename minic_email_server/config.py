import os

# email-server related
EMAIL_SERVER_PORT = int(os.environ.get("EMAIL_SERVER_PORT", 23452))
EMAIL_SERVER_HOST = os.environ.get("EMAIL_SERVER_HOST", 'localhost')
EMAIL_SERVER_URL = os.environ.get("EMAIL_SERVER_URL", f"http://{EMAIL_SERVER_HOST}:{EMAIL_SERVER_PORT}")

# rabbitmq-related
EMAIL_VERIFICATION_QUEUE = os.environ.get("EMAIL_VERIFICATION_QUEUE", 'email-verification')

# gmail-related
GMAIL_USERNAME = os.environ.get("GMAIL_USERNAME", None)
GMAIL_PASSWORD = os.environ.get("GMAIL_PASSWORD", None)

# mongo-related
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "minic-server")
MONGO_USER_COLLECTION = os.environ.get("MONGO_USER_COLLECTION", "users")