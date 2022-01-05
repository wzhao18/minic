from datetime import datetime, timedelta

import cryptography
from cryptography.fernet import Fernet

class ExpiringTokenManager:

    @classmethod
    def initialize(self):
        self.key = Fernet.generate_key()
        self.fernet = Fernet(self.key)
        self.date_format = '%Y-%m-%d %H-%M-%S'

    @classmethod
    def get_time(self):
        return datetime.utcnow().strftime(self.date_format)

    @classmethod
    def parse_time(self, d):
        return datetime.strptime(d, self.date_format)

    @classmethod
    def generate_token(self, text):
        full_text = text + '|' + self.get_time()
        token = self.fernet.encrypt(full_text.encode('ascii'))
        return token.decode('ascii')

    @classmethod
    def get_token_value(self, token):
        try:
            value = self.fernet.decrypt(token.encode('ascii')).decode('ascii')
            separator_pos = value.rfind('|')
            text = value[:separator_pos]

            token_time = self.parse_time(value[separator_pos + 1:])
            if token_time + timedelta(hours=1) < datetime.utcnow():
                return None

        except cryptography.fernet.InvalidToken:
            return None

        return text


if __name__ == "__main__":
    ExpiringTokenGenerator.initialize()
    token = ExpiringTokenGenerator.generate_token("wzhao@ibm.com")
    print(ExpiringTokenGenerator.get_token_value(token))