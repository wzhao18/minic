from flask_httpauth import HTTPBasicAuth

from minic_server.auth.auth import Auth
from minic_server.config.config import *

minicc_auth = HTTPBasicAuth()

@minicc_auth.verify_password
def authenticate(username, password):
    if Auth.validate_username_password_pair(username, password):
        if not ENFORCE_EMAIL_VERIFICATION or Auth.check_user_account_activated(username):
            return True
    return False