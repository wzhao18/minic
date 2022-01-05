import re
from setuptools import setup

install_requires = []

with open("requirements.txt") as f:
    requirements = f.read()

for line in re.split("\n", requirements):
    if line and line[0] != "#" and not line.startswith("-e"):
        install_requires.append(line)

setup(
    name="minic-ltm",
    version="0.1.0",
    description="None",
    packages=['minic_ltm'],
    package_dir={'minic_ltm': '.'},
    install_requires=install_requires
)