import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def gmail_smtp_login(username, password):
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587) 
        server.ehlo()
        server.starttls()
        server.login(username,password)
        return server
    except:
        return None

def send_gmail(smtp_server, receiver, subject, body):
    message = MIMEMultipart()
    message['to'] = receiver
    message['subject'] = subject
    message.attach(MIMEText(body, 'plain'))
    smtp_server.sendmail('me', receiver, message.as_string())