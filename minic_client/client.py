import requests
from requests.auth import HTTPBasicAuth
import os
import json

class MinicClient:
    url: str
    headers: dict
    email: str
    username: str
    password: str

    def __init__(self, username, password):
        host_name = os.environ.get("MINIC_SERVER_HOST", "localhost")
        port = os.environ.get("MINIC_SERVER_PORT", "33450")
        self.url = f"http://{host_name}:{port}"
        self.headers = { 
            'Accept': '*/*',
            'Content-Type': 'application/json' 
        }
        self.email = f"{username}@minic.com"
        self.username = username
        self.password = password

    def register_user(self):
        payload = json.dumps({ "email": self.email, "username": self.username, "password": self.password})
        response = requests.post(f'{self.url}/auth/register', headers=self.headers, data=payload)
        return response.status_code, response.json()
    
    def login_user(self):
        response = requests.get(f'{self.url}/auth/login', auth=HTTPBasicAuth(self.username, self.password), headers=self.headers)
        return response.status_code, response.json()

    def send_compile_request(self, file_name, language, optLevel, code):
        payload = json.dumps({ "file_name": file_name, "language": language, "optLevel": optLevel, "code": code })
        params = {"operation": "compile"}
        response = requests.post(f'{self.url}/service', auth=HTTPBasicAuth(self.username, self.password), headers=self.headers, data=payload, params=params)
        return response.status_code, response.json()
    
    def send_execute_request(self, file_name, language, optLevel, code):
        payload = json.dumps({ "file_name": file_name, "language": language, "optLevel": optLevel, "code": code })
        params = {"operation": "execute"}
        response = requests.post(f'{self.url}/service', auth=HTTPBasicAuth(self.username, self.password), headers=self.headers, data=payload, params=params)
        return response.status_code, response.json()

    def get_file_tree(self):
        response = requests.get(f'{self.url}/code', auth=HTTPBasicAuth(self.username, self.password), headers=self.headers)
        return response.status_code, response.json()
    
    def delete_file_or_folder(self, path):
        payload = json.dumps({ "path": path })
        response = requests.delete(f'{self.url}/code', auth=HTTPBasicAuth(self.username, self.password), headers=self.headers, data=payload)
        return response.status_code, response.json()