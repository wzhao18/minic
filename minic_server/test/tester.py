import unittest
import os
import pathlib

from random_username.generate import generate_username
from multiprocessing import Process

from minic_client.client import MinicClient

class MinicTester:

    def generic_check_response(self, result):
        status_code, response_json = result
        # print(response_json)
        assert(status_code == 200)

    def _delete_file_tree(self, client, tree, path):
        print("deleting " + path)
        if "id" in tree:
            result = client.delete_file_or_folder(path)
            self.generic_check_response(result)
        elif "items" in tree:
            for item in tree["items"]:
                item_name = item["name"]
                item_path = path + "/" + item_name if path != "/" else path + item_name
                self._delete_file_tree(client, item, item_path)
            if path not in ["/", "/history"]:
                result = client.delete_file_or_folder(path)
                self.generic_check_response(result)

    def delete_file_tree(self, client):
        result = client.get_file_tree()
        self.generic_check_response(result)

        file_tree = result[1]
        self._delete_file_tree(client, file_tree, "/")

    def compile_and_execute_test_files(self, client):
        tester_file_path = pathlib.Path(__file__).parent.resolve()
        test_files_directory = os.path.join(tester_file_path, "files") 
        for lan_dir_name in os.listdir(test_files_directory):
            if lan_dir_name == ".DS_Store":
                continue
            lan_dir = os.path.join(test_files_directory, lan_dir_name) 
            for file_name in os.listdir(lan_dir):
                if file_name == ".DS_Store":
                    continue
                f = os.path.join(lan_dir, file_name)
                if os.path.isfile(f):
                    with open(f, "r") as file:
                        content = file.read()
                        result = client.send_compile_request(file_name=None, language=lan_dir_name, optLevel=3, code=content)
                        result = client.send_execute_request(file_name=None, language=lan_dir_name, optLevel=3, code=content)
                        self.generic_check_response(result)

    def green_thread_flow(self):
        random_username = generate_username(1)[0]
        client = MinicClient(random_username, random_username)
        print("Username is " + random_username)

        result = client.register_user()
        self.generic_check_response(result)

        result = client.login_user()
        self.generic_check_response(result)

        self.compile_and_execute_test_files(client)
        self.delete_file_tree(client)

def test_green_thread():
    tester = MinicTester()
    tester.green_thread_flow()

class TestMinicServer(unittest.TestCase):

    def test_multiple_client_run_green_thread_flow(self):
        client_processes = []
        for i in range(20):
            p = Process(target=test_green_thread, args=[])
            client_processes.append(p)
            p.start()
        
        for p in client_processes:
            p.join()

if __name__ == '__main__':
    unittest.main()
