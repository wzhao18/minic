from pymongo import MongoClient

from minic_ltm.config import *

class LongTermMemory:

    client: MongoClient
    
    @classmethod
    def initialize(cls):
        if MONGO_HOST == "mongo":
            cls.client = MongoClient(MONGO_URL, username=MONGO_ADMIN_USERNAME, password=MONGO_ADMIN_PASSWORD, port=MONGO_PORT)
        else:
            cls.client = MongoClient(MONGO_URL, port=MONGO_PORT)
    
    @classmethod
    def destroy(cls):
        cls.client.close()
    
    @classmethod
    def remember(cls, db_name, collection_name, data):
        minicc_server_db = cls.client.get_database(db_name)
        collection = minicc_server_db.get_collection(collection_name)
        return collection.insert_one(data)
    
    @classmethod
    def recall(cls, db_name, collection_name, data):
        minicc_server_db = cls.client.get_database(db_name)
        collection = minicc_server_db.get_collection(collection_name)
        document = collection.find_one(data)
        return document
    
    @classmethod
    def recall_many(cls, db_name, collection_name, data):
        minicc_server_db = cls.client.get_database(db_name)
        collection = minicc_server_db.get_collection(collection_name)
        documents = collection.find(data)
        return documents
    
    @classmethod
    def update(cls, db_name, collection_name, query, data):
        minicc_server_db = cls.client.get_database(db_name)
        collection = minicc_server_db.get_collection(collection_name)
        documents = collection.update_one(query, data)
        return documents
    
    @classmethod
    def forget(cls, db_name, collection_name, query):
        minicc_server_db = cls.client.get_database(db_name)
        collection = minicc_server_db.get_collection(collection_name)
        collection.delete_one(query)