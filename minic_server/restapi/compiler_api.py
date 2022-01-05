from flask import jsonify, request, Blueprint
from datetime import datetime

from minic_server.compiler.compiler import Compiler
from minic_server.auth.auth import Auth
from minic_server.restapi.basic_auth import minicc_auth

compiler_api = Blueprint('compiler_api', __name__)

@compiler_api.route('/service', methods=['POST'])
@minicc_auth.login_required
def serve():
    operation = request.args.get('operation')
    if operation not in ["compile", "execute"]:
        return jsonify("Operation is unknown, please specify in query parameter"), 400

    username = request.authorization["username"]
    request_payload = request.json
    file_name = request_payload.get("file_name", "")
    language = request_payload.get("language")
    optLevel = request_payload.get("optLevel", 0)
    code = request_payload.get("code", "")

    if not language:
        return jsonify("Language is unknown"), 400
    if not file_name:
        file_name = f"{username}-{datetime.utcnow().strftime('%Y-%m-%d-%H:%M:%S.%f')[:-3]}"
    if optLevel not in [0, 1, 2, 3]:
        optLevel = 0

    result, success = Compiler.process_service_request(operation, username, file_name, language, optLevel, code)
    return jsonify(result), 200 if success else 400
