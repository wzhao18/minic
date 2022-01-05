import json
from flask import Flask

from gmail import gmail_smtp_login, send_gmail
from minic_messaging.rabbitmq.adapter import RabbitmqBlockingTaskQueueAdapter, rabbitmq_logger
from minic_ltm.ltm import LongTermMemory
from minic_email_server.expiring_token import ExpiringTokenManager
from minic_email_server.config import *

gmail_smtp_server = gmail_smtp_login(GMAIL_USERNAME, GMAIL_PASSWORD)
minic_email_server = Flask("minic_email_server")

def email_verification_callback(ch, method, properties, body):
    try:
        body_decoded = json.loads(body.decode('utf-8'))
        rabbitmq_logger.debug(f"Received {body_decoded}")

        email = body_decoded["email"]
        username = body_decoded["username"]
        token = ExpiringTokenManager.generate_token(email)
        subject = "Account Activation for MiniC"
        activation_link = f"{EMAIL_SERVER_URL}/activate/{token}"
        content = f"Hello {username},\n\nWelcome to MiniC, please click the link below to activate your account.\n{activation_link}\n\nThank you,\nMiniC\n"

        rabbitmq_logger.debug(f"Sending email to {email} with subject: {subject} and content: {content}")
        send_gmail(gmail_smtp_server, email, subject, content)
    except:
        print("Failed to send email")
    finally:
        ch.basic_ack(delivery_tag = method.delivery_tag)

@minic_email_server.route('/', methods=['GET'])
def home():
    return """<h1>Email Verification Service Backend</h1>
              <p>This server is in progress yet.</p>"""

@minic_email_server.route('/activate/<token>', methods=['GET'])
def verify_email(token):
    email = ExpiringTokenManager.get_token_value(token)
    if email:
        user = LongTermMemory.recall(MONGO_DB_NAME, MONGO_USER_COLLECTION, {"email": email})
        if user:
            LongTermMemory.update(MONGO_DB_NAME, MONGO_USER_COLLECTION, {"email": email}, {"$set": {"status": "validated"}})
            return f"<p>You have successfully activated your account {email}.</p>", 200
    return "", 404

def initialize():
    ExpiringTokenManager.initialize()
    LongTermMemory.initialize()
    adapter = RabbitmqBlockingTaskQueueAdapter()
    adapter.subscribe(EMAIL_VERIFICATION_QUEUE, email_verification_callback)

def run():
    initialize()
    minic_email_server.run(
        port=23452,
        host='0.0.0.0',
        threaded=True
    )

if __name__ == "__main__":
    run()