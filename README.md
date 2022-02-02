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

## Deploy ##

The project can be deployed either with [Docker Compose](https://docs.docker.com/compose/) or [Kubernetes](https://kubernetes.io/).  

Docker Compose:

```
git clone https://github.com/wzhao18/minic --recursive
cd minic
mkdir -p data/mongo
docker compose up
```

Kubernetes:

```
kubectl create ns minic
kustomize build deploy/prod | kubectl -n minic apply -f -
kubectl port-forward service/nginx -n minic 33450:33450 33451:33451 33452:33452
```

Visit http://localhost:33451 for the webclient.

## Scaling ##

To scale up the servers, increase the setting of **replicas** in the [`docker-compose.yaml`](https://github.com/wzhao18/minic/blob/master/docker-compose.yaml) or the Kubernetes deployment files depending on the way of deployment. For MiniC-Server, the number of threads and processes can be set through environment variables in [`gunicorn_config.py`](https://github.com/wzhao18/minic/blob/master/minic_server/config/gunicorn_config.py).

## CI/CD ##

Deploy an instance of [Jenkins](https://www.jenkins.io/) server along with a worker agent:

```
mkdir jenkins
docker run \
  -d --rm \
  --name=jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v ${PWD}/jenkins:/var/jenkins_home \
  jenkins/jenkins
docker build -t jenkins-agent -f Dockerfile.jenkins-agent .
docker run \
  -i -d --rm --name agent \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --init --network=host \
  jenkins-agent \
  java -jar /usr/share/jenkins/agent.jar \
  -jnlpUrl http://localhost:8080/computer/agent/jenkins-agent.jnlp \
  -secret [PASTE SECRET HERE] -workDir "/home/jenkins/agent"
```

Creating a local kubernetes cluster with [minikube](https://minikube.sigs.k8s.io/docs/):

```
minikube start --vm-driver virtualbox
kubectl config view --minify --flatten > kubeconfig
```
