from flask import jsonify, request, Blueprint

from minic_server.auth.auth import Auth
from minic_server.config.config import *

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/auth/register', methods=['POST'])
def register_user():
    request_payload = request.json
    email = request_payload.get("email")
    username = request_payload.get("username")
    password = request_payload.get("password")
    if not email or not username or not password:
        return jsonify("Email, Username or Password must not be empty."), 400

    if Auth.register_user(email, username, password):
        return jsonify({"username": username}), 200

    return jsonify("Email or Username already exists."), 409

@auth_api.route('/auth/login', methods=['GET'])
def login_user():
    username = request.authorization["username"]
    password = request.authorization["password"]
    if not username or not password:
        return jsonify("Username or Password must not be empty."), 400

    if Auth.validate_username_password_pair(username, password):
        if not ENFORCE_EMAIL_VERIFICATION or Auth.check_user_account_activated(username):
            return jsonify({"username": username}), 200
        else:
            return jsonify("Account is not activated. Please check your email inbox for an account activation email."), 409
    
    return jsonify("Username or Password is wrong. Please try again."), 403

@auth_api.route('/auth/activation', methods=['POST'])
def send_activation_email():
    request_payload = request.json
    username = request_payload.get("username")
    if not username:
        return jsonify("Username must not be empty."), 400

    Auth.send_activation_email(username)
    return jsonify("success"), 200