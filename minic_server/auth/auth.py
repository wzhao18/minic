import bcrypt

from minic_ltm.ltm import LongTermMemory
from minic_server.code.code_mgmt import CodeManager
from minic_server.config.config import MONGO_DB_NAME, MONGO_USER_COLLECTION
from minic_server.messenger.messenger import Messenger
from minic_server.config.config import *

class Auth:
    @classmethod
    def initialize(cls):
        Messenger.prepare_dispatcher(EMAIL_VERIFICATION_QUEUE)

    @classmethod
    def get_hashed_password(cls, password): 
        password_encoded = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_encoded, salt)
        return hashed

    @classmethod
    def check_password_match(cls, password, hashedPassword): 
        password_encoded = password.encode('utf-8')
        return bcrypt.checkpw(password_encoded, hashedPassword)

    @classmethod
    def send_activation_email(cls, username):
        user = LongTermMemory.recall(MONGO_DB_NAME, MONGO_USER_COLLECTION, { "username": username })
        if user and user["status"] == "validation":
            Messenger.publish(EMAIL_VERIFICATION_QUEUE, {"email": user["email"], "username": username})

    @classmethod
    def register_user(cls, email, username, password):
        by_username = LongTermMemory.recall(MONGO_DB_NAME, MONGO_USER_COLLECTION, {"username": username})
        by_email = LongTermMemory.recall(MONGO_DB_NAME, MONGO_USER_COLLECTION, {"email": email})
        if by_username is not None or by_email is not None:
            return False

        password_hashed = cls.get_hashed_password(password)
        user = {
            "email": email,
            "username": username,
            "password": password_hashed,
            "status": "validation"
        }
        LongTermMemory.remember(MONGO_DB_NAME, MONGO_USER_COLLECTION, user)
        CodeManager.initialize_user_file_tree(username)
        cls.send_activation_email(username)
        return True

    @classmethod
    def validate_username_password_pair(cls, username, password):
        user = LongTermMemory.recall(MONGO_DB_NAME, MONGO_USER_COLLECTION, {"username": username})
        if user and cls.check_password_match(password, user["password"]):
            return True
        return False
    
    @classmethod
    def check_user_account_activated(cls, username):
        user = LongTermMemory.recall(MONGO_DB_NAME, MONGO_USER_COLLECTION, {"username": username})
        if user and user["status"] == "validated":
            return True
        return False