from flask import Flask

from minic_logger.logger import minic_logger
minic_server_logger = minic_logger("minic-server", "DEBUG")

from minic_ltm.ltm import LongTermMemory
from minic_server.compiler.compiler import Compiler
from minic_server.messenger.messenger import Messenger
from minic_server.auth.auth import Auth
from minic_server.restapi.compiler_api import compiler_api
from minic_server.restapi.auth_api import auth_api
from minic_server.restapi.code_mgmt_api import code_mgmt_api

minic_server = Flask("minic_server")

minic_server.register_blueprint(compiler_api)
minic_server.register_blueprint(auth_api)
minic_server.register_blueprint(code_mgmt_api)

@minic_server.route('/', methods=['GET'])
def home():
    return """<h1>Online MiniC Compiler Backend</h1>
              <p>This server is in progress yet.</p>"""

def initialize():
    minic_server_logger.info("Initializing minic server components")
    for component in [LongTermMemory, Compiler, Messenger, Auth]:
        component.initialize()

def run():
    initialize()
    minic_server.run(
        port=23450,
        host='0.0.0.0',
        threaded=True
    )

if __name__ == "__main__":
    run()