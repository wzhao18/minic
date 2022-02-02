pipeline {
    agent {
        label 'agent'
    }
    stages {
        stage('update submodules') {
			steps {
                sh 'rm -rf minic_compiler'
				dir('minic_compiler'){
					git(
						url: "git@github.com:wzhao18/minic_compiler.git",
						credentialsId: 'minic-compiler-deploy-key',
						branch: "master"
					)
				}
                sh """
                    cd minic_compiler
                    git submodule init
                    git submodule update
                """
			}
		}
        stage('build images') {
            environment {
                DOCKER_REGISTRY_CREDS='docker-registry-creds'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: DOCKER_REGISTRY_CREDS, usernameVariable: 'DOCKER_REGISTRY_USERNAME', passwordVariable: 'DOCKER_REGISTRY_PASSWORD')]) {
                    sh """
                        docker login --username=${DOCKER_REGISTRY_USERNAME} --password=${DOCKER_REGISTRY_PASSWORD} docker.io
                        docker build -t teemo222/minic-server:ci -f Dockerfile.server .
                        docker build -t teemo222/minic-webclient:ci -f Dockerfile.webclient .
                        docker build -t teemo222/minic-email-server:ci -f Dockerfile.email-server .
                        docker build -t teemo222/minic-tester:ci -f Dockerfile.tester .
                        docker push teemo222/minic-server:ci
                        docker push teemo222/minic-webclient:ci
                        docker push teemo222/minic-email-server:ci
                        docker push teemo222/minic-tester:ci
                    """
                }
            }
        }
        stage('deploy and test with kubernetes') {
            environment {
                KUBECONFIG=credentials("minikube-kubeconfig")
                K8S_NS='minic'
            }
            steps {
                sh """
                    kubectl create ns ${K8S_NS}
                    kustomize build deploy/ci | kubectl -n ${K8S_NS} apply -f -
                    sleep 90
                    timeout 10m bash -c "until kubectl -n '${K8S_NS}' get jobs minic-tester -o jsonpath='{.status.conditions[*].status}' | grep True ; do sleep 5; done"
                """
                sh """
                    kubectl -n ${K8S_NS} logs deployment/minic | tee minic-server.log 1>/dev/null || true
                    kubectl -n ${K8S_NS} logs deployment/minic-webclient | tee minic-webclient.log 1>/dev/null || true
                    kubectl -n ${K8S_NS} logs deployment/minic-email-server | tee minic-email-server.log 1>/dev/null || true
                    kubectl -n ${K8S_NS} logs deployment/nginx | tee nginx.log 1>/dev/null || true
                    kubectl -n ${K8S_NS} logs deployment/rabbitmq | tee rabbitmq.log 1>/dev/null || true
                    kubectl -n ${K8S_NS} logs deployment/mongo | tee mongo.log 1>/dev/null || true
                    kubectl -n ${K8S_NS} logs job/minic-tester | tee minic-tester.log 1>/dev/null || true
                    if cat minic-tester.log | grep -q -s "Traceback (most recent call last)"; then false; else true; fi
                    if cat minic-tester.log | grep -q -s "OK"; then true; else false; fi
                """
            }
            post {
                cleanup {
                    sh """
                        kustomize build deploy/ci | kubectl -n ${K8S_NS} delete --ignore-not-found=true -f -
                        kubectl delete --ignore-not-found=true ns ${K8S_NS}
                    """
                }
            }
        }
    }
    post {
        success {
            sh """
                docker tag teemo222/minic-server:ci teemo222/minic-server:latest
                docker tag teemo222/minic-webclient:ci teemo222/minic-webclient:latest
                docker tag teemo222/minic-email-server:ci teemo222/minic-email-server:latest
                docker tag teemo222/minic-tester:ci teemo222/minic-tester:latest
                docker push teemo222/minic-server:latest
                docker push teemo222/minic-webclient:latest
                docker push teemo222/minic-email-server:latest
                docker push teemo222/minic-tester:latest
            """
        }
        cleanup {
            sh """
                docker rmi \
                    teemo222/minic-server:ci \
                    teemo222/minic-webclient:ci \
                    teemo222/minic-email-server:ci \
                    teemo222/minic-tester:ci \
                    teemo222/minic-server:latest \
                    teemo222/minic-webclient:latest \
                    teemo222/minic-email-server:latest \
                    teemo222/minic-tester:latest
            """
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
            cleanWs()
        }
    }
}