# minic

This repository contains code for the project **minic**. It composes of a compiler and a web-playground that allows users to try out the compiler directly on the browser. The purpose of this project is to explore and practice using some trending frameworks and software tools (such as [LLVM](https://github.com/llvm/llvm-project) and [React](https://reactjs.org/)) as well as to investigate some basic approaches on server scaling. Below is an overview of the major components of minic.

* [**MiniC-Compiler**](https://github.com/wzhao18/minic_compiler/tree/f4328fdb4d128ade29c08322a323bce87f4d17d3)
  * Compiler for the language [MiniC](https://github.com/wzhao18/minic_compiler/tree/f4328fdb4d128ade29c08322a323bce87f4d17d3) written with the [LLVM framework](https://github.com/llvm/llvm-project). This part is based off a course project from CSC488 instructed by Prof. Fan Long at the University of Toronto.
* [**MiniC-Server**](https://github.com/wzhao18/minic/tree/master/minic_server)
  * [Flask-based](https://flask.palletsprojects.com/en/2.0.x/) backend server scaled with [Gunicorn](https://gunicorn.org/) that provides REST API to handle HTTP requests to compile and execute programs written in MiniC and manage user data. It connects with [MongoDB](https://www.mongodb.com/) to store user files and [rabbitmq](https://www.rabbitmq.com/) to dispatch asynchronous tasks to worker nodes.
* [**MiniC-WebClient**](https://github.com/wzhao18/minic/tree/master/minic_webclient)
  * Front-end server that provides an web-page graphic user interface to send requests to the backend server. The graphic is supported by [React](https://reactjs.org/) served with [Express](https://expressjs.com/). It allows users to edit code on the browser and store files in their virtual file systems.
* [**MiniC-Email-Server**](https://github.com/wzhao18/minic/tree/master/minic_email_server)
  * Backend server responsible for user email authentication services. It listens from [rabbitmq](https://www.rabbitmq.com/) queues where tasks are dispatched by the  MiniC-Server.
* [**Nginx**](https://github.com/wzhao18/minic/tree/master/nginx)
  * Reverse proxy and load balancer that allows scaling of all the servers mentioned above in minic. 

## How to run ##

The project can be easily run with the support of [docker compose](https://docs.docker.com/compose/). 

```
git clone https://github.com/wzhao18/minic --recursive
cd minic
mkdir -p data/mongo
docker compose up
```
## Scaling ##

To scale up the servers, increase the setting of **replicas** in the [`docker-compose.yaml`](https://github.com/wzhao18/minic/blob/master/docker-compose.yaml). Alternatively for MiniC-Server, change the setting of environment variables in [`gunicorn_config.py`](https://github.com/wzhao18/minic/blob/master/minic_server/config/gunicorn_config.py).
