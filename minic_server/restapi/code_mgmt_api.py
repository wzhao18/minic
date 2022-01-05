from flask import jsonify, request, Blueprint

from minic_server.code.code_mgmt import CodeManager
from minic_server.restapi.basic_auth import minicc_auth

code_mgmt_api = Blueprint('code_mgmt_api', __name__)

@code_mgmt_api.route('/code', methods=['DELETE'])
@minicc_auth.login_required
def delete_file_or_directory():
    request_payload = request.json
    path = request_payload.get("path")
    username = request.authorization["username"]

    if not path:
        return jsonify("Path is not specified"), 400
    
    if CodeManager.delete_file_or_dir_for_user(username, path):
        return jsonify("success"), 200

    return jsonify("Failed"), 400

@code_mgmt_api.route('/code', methods=['POST'])
@minicc_auth.login_required
def save_code():
    request_payload = request.json
    type = request.args.get('type')
    path = request_payload.get("path")
    code = request_payload.get("code", "")
    username = request.authorization["username"]

    if not type or not path:
        return jsonify("Type or path is not specified"), 400

    if type == "file" and CodeManager.save_code_for_user(username, path, code):
        return jsonify("success"), 200
    if type == "folder" and CodeManager.create_directory_to_file_tree(username, path):
        return jsonify("success"), 200
    
    return jsonify("Failed"), 400

@code_mgmt_api.route('/code', methods=['GET'])
@minicc_auth.login_required
def get_user_file_tree():
    username = request.authorization["username"]
    file_tree = CodeManager.get_user_file_system(username)
    return jsonify(file_tree), 200

@code_mgmt_api.route('/code/fs/<path:subpath>', methods=['GET'])
@minicc_auth.login_required
def get_user_file(subpath):
    path = "/" + subpath
    username = request.authorization["username"]
    file = CodeManager.get_code_for_user(username, path)
    if file is not None:
        return jsonify(file), 200
    return jsonify(f"File {path} is not found for user {username}"), 400

@code_mgmt_api.route('/code/fs/<path:subpath>', methods=['PATCH'])
@minicc_auth.login_required
def update_user_file(subpath):
    request_payload = request.json
    code = request_payload.get("code", None)
    new_name = request_payload.get("newName", None)
    path = "/" + subpath
    username = request.authorization["username"]

    if CodeManager.update_file_or_dir_for_user(username, path, new_name, code):
        return jsonify("success"), 200
    
    return jsonify(f"Failed to update"), 400

    