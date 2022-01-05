import os

# Mongo-related
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "minic-server")
MONGO_USER_COLLECTION = os.environ.get("MONGO_USER_COLLECTION", "users")
MONGO_FS_TREE_COLLECTION = os.environ.get("MONGO_FS_TREE_COLLECTION", "fs-tree")
MONGO_CODE_COLLECTION = os.environ.get("MONGO_CODE_COLLECTION", "code")

# Compiler-related
C_COMPILER = os.environ.get("C_COMPILER", "clang-11")
CXX_COMPILER = os.environ.get("CXX_COMPILER", "clang++-11")
MINIC_COMPILER = os.environ.get("MINIC_COMPILER", "clang-mini")
MINIC_IO_LIB = os.environ.get("MINIC_IO_LIB", "minicio")

# rabbitmq-related
EMAIL_VERIFICATION_QUEUE = os.environ.get("EMAIL_VERIFICATION_QUEUE", "email-verification")

# general
ENFORCE_EMAIL_VERIFICATION = os.environ.get("ENFORCE_EMAIL_VERIFICATION", "True") == "True"