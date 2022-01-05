from bson.objectid import ObjectId

from minic_ltm.ltm import LongTermMemory
from minic_server.config.config import *

NEW_FILE_TREE = {
    "name": "root",
    "items": [
        {
            "name": "history",
            "items": []
        }
    ]
}

class CodeManager:
    @classmethod
    def initialize(cls):
        pass
    
    @classmethod
    def initialize_user_file_tree(cls, username):
        LongTermMemory.remember(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username, "file_tree": NEW_FILE_TREE})
        return True

    @classmethod
    def get_user_file_system(cls, username):
        user_file_tree_doc = LongTermMemory.recall(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username})
        return user_file_tree_doc["file_tree"]

    @classmethod
    def is_directory(cls, item):
        return True if "items" in item else False
    
    @classmethod
    def get_directory_items_names(cls, directory):
        names = [k["name"] for k in directory["items"]]
        return names

    @classmethod
    def get_directory_from_tree(cls, file_tree, path):
        dir_names = path.split("/")[1:-1]

        curr_dir = file_tree
        for dir_name in dir_names:
            curr_dir = next(iter(k for k in curr_dir["items"] if cls.is_directory(k) and k["name"] == dir_name), None)
            if not curr_dir:
                return {}

        return curr_dir

    @classmethod
    def append_file_to_file_tree(cls, username, path, file_id):
        file_name = path.split("/")[-1]
        if file_name == "":
            return False

        user_file_tree_doc = LongTermMemory.recall(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username})
        if not user_file_tree_doc:
            return False

        user_file_tree = user_file_tree_doc["file_tree"]
        directory = cls.get_directory_from_tree(user_file_tree, path)

        if not directory:
            return False

        if file_name not in cls.get_directory_items_names(directory):
            directory["items"].append({
                "name": file_name,
                "id": file_id
            })
            LongTermMemory.update(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username}, {"$set": {"file_tree": user_file_tree}})

        return True
    
    @classmethod
    def create_directory_to_file_tree(cls, username, path):
        dir_name = path.split("/")[-1]
        if dir_name == "":
            return False

        user_file_tree_doc = LongTermMemory.recall(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username})
        if not user_file_tree_doc:
            return False
        
        user_file_tree = user_file_tree_doc["file_tree"]
        directory = cls.get_directory_from_tree(user_file_tree, path)

        if not directory:
            return False
        
        if dir_name not in cls.get_directory_items_names(directory):
            directory["items"].append(
                {
                    "name": dir_name,
                    "items": []
                }
            )
            LongTermMemory.update(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username}, {"$set": {"file_tree": user_file_tree}})
        
        return True

    @classmethod
    def save_code_for_user(cls, username, path, code):
        user_file_tree_doc = LongTermMemory.recall(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username})
        user_file_tree = user_file_tree_doc["file_tree"]

        directory = cls.get_directory_from_tree(user_file_tree, path)
        if not directory:
            return False

        file_name = path.split("/")[-1]
        if file_name in cls.get_directory_items_names(directory):
            return False

        code_document = {
            "code": code
        }
        result = LongTermMemory.remember(MONGO_DB_NAME, MONGO_CODE_COLLECTION, code_document)
        file_id = str(result.inserted_id)

        return cls.append_file_to_file_tree(username, path, file_id)      

    @classmethod  
    def get_code_for_user(cls, username, path):
        user_file_tree_doc = LongTermMemory.recall(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username})
        user_file_tree = user_file_tree_doc["file_tree"]

        directory = cls.get_directory_from_tree(user_file_tree, path)
        if not directory:
            return False

        file_name = path.split("/")[-1]        
        obj, obj_type = cls.get_file_or_dir_from_directory(directory, file_name)
        if not obj or obj_type == "directory":
            return False

        file_id = obj["id"]
        code_document = LongTermMemory.recall(MONGO_DB_NAME, MONGO_CODE_COLLECTION, {"_id": ObjectId(file_id)})
        if code_document:
            return code_document["code"]

        return None

    @classmethod
    def get_file_or_dir_from_directory(cls, directory, file_or_dir_name):
        for item in directory["items"]:
            if item["name"] == file_or_dir_name:
                return item, "directory" if cls.is_directory(item) else "file"

        return None, None
    
    @classmethod  
    def update_file_or_dir_for_user(cls, username, path, new_name=None, code=None):
        if path in ["/", "/history"]:
            return False
    
        if code is None and not new_name:
            return False

        user_file_tree_doc = LongTermMemory.recall(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username})
        user_file_tree = user_file_tree_doc["file_tree"]

        file_or_dir_name = path.split("/")[-1]
        directory = cls.get_directory_from_tree(user_file_tree, path)
        if not directory:
            return False
        
        obj, obj_type = cls.get_file_or_dir_from_directory(directory, file_or_dir_name)

        if code is not None:
            if obj_type == "directory":
                return False
            file_id = obj["id"]
            LongTermMemory.update(MONGO_DB_NAME, MONGO_CODE_COLLECTION, {"_id": ObjectId(file_id)}, {"$set": {"code": code}})
  
        if new_name:
            idx = directory["items"].index(obj)

            if obj_type == "file":
                file_id = obj["id"]
                directory["items"][idx] = {
                    "name": new_name,
                    "id": file_id
                }
            else:
                renamed_folder = {
                    "name": new_name,
                    "items": obj["items"]
                }
                directory["items"][idx] = renamed_folder
            
            LongTermMemory.update(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username}, {"$set": {"file_tree": user_file_tree}})
        
        return True

    @classmethod  
    def delete_file_or_dir_for_user(cls, username, path):
        if path in ["/", "/history"]:
            return False

        user_file_tree_doc = LongTermMemory.recall(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username})
        user_file_tree = user_file_tree_doc["file_tree"]

        file_or_dir_name = path.split("/")[-1]
        directory = cls.get_directory_from_tree(user_file_tree, path)
        if not directory:
            return False

        obj, obj_type = cls.get_file_or_dir_from_directory(directory, file_or_dir_name)
        
        if not obj:
            return False
        
        if obj_type == "file":
            file_id = obj["id"]
            directory["items"].remove(obj)
            LongTermMemory.forget(MONGO_DB_NAME, MONGO_CODE_COLLECTION, {"_id": ObjectId(file_id)})
        else:
            if len(obj["items"]) > 0:
                return False
            directory["items"].remove(obj)
        LongTermMemory.update(MONGO_DB_NAME, MONGO_FS_TREE_COLLECTION, {"username": username}, {"$set": {"file_tree": user_file_tree}})
        
        return True