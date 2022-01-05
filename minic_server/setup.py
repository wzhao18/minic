import re
from setuptools import setup

install_requires = []

with open("requirements.txt") as f:
    requirements = f.read()

for line in re.split("\n", requirements):
    if line and line[0] != "#" and not line.startswith("-e"):
        install_requires.append(line)

setup(
    name="minic-server",
    version="0.1.0",
    description="None",
    packages=['minic_server', 
    'minic_server.compiler',
    'minic_server.restapi',
    'minic_server.auth',
    'minic_server.code',
    'minic_server.config',
    'minic_server.messenger'],
    package_dir={'minic_server': '.'},
    install_requires=install_requires
)