
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        PATH = "/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/local/bin:${env.PATH}"

        ACR_NAME = "campusconnectacr"
        ACR_LOGIN_SERVER = "campusconnectacr.azurecr.io"
        IMAGE_NAME = "campusconnect"

        KUBE_CONTEXT = "campusconnect-aks"
        KUBECONFIG = "/Users/lavanya/.kube/config"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Gitleaks Security Scan') {
            steps {
                sh '''
                    /usr/local/bin/docker run --rm \
                    -v "$WORKSPACE":/repo \
                    zricethezav/gitleaks:latest \
                    git /repo --redact --no-banner
                '''
            }
        }

        stage('Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'campus-db-username',
                           variable: 'DB_USERNAME'),
                    string(credentialsId: 'campus-db-password',
                           variable: 'DB_PASSWORD')
                ]) {
                    sh '''
                        chmod +x mvnw
                        ./mvnw clean package -DskipTests
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                withCredentials([
                    string(credentialsId: 'campus-db-username',
                           variable: 'DB_USERNAME'),
                    string(credentialsId: 'campus-db-password',
                           variable: 'DB_PASSWORD')
                ]) {
                    sh './mvnw test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    /usr/local/bin/docker buildx build \
                    --platform linux/amd64 \
                    -t ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${BUILD_NUMBER} \
                    -t ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:latest \
                    --load .
                '''
            }
        }

        stage('Docker Push to ACR') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'acr-service-principal',
                        usernameVariable: 'ACR_CLIENT_ID',
                        passwordVariable: 'ACR_CLIENT_SECRET'
                    )
                ]) {
                    sh '''
                        echo "$ACR_CLIENT_SECRET" | \
                        /usr/local/bin/docker login \
                        ${ACR_LOGIN_SERVER} \
                        --username "$ACR_CLIENT_ID" \
                        --password-stdin

                        /usr/local/bin/docker push \
                        ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${BUILD_NUMBER}

                        /usr/local/bin/docker push \
                        ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:latest

                        /usr/local/bin/docker logout ${ACR_LOGIN_SERVER}
                    '''
                }
            }
        }

        stage('Deploy to Azure AKS') {
            steps {
                sh '''
                    export KUBECONFIG=/Users/lavanya/.kube/config

                    /opt/homebrew/bin/ansible-playbook \
                    -i ansible/inventory.ini \
                    ansible/deploy.yml \
                    -e image_tag=${BUILD_NUMBER}
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    export KUBECONFIG=/Users/lavanya/.kube/config

                    echo "Current Kubernetes context:"
                    /opt/homebrew/bin/kubectl config current-context

                    echo "Deployments:"
                    /opt/homebrew/bin/kubectl get deployments

                    echo "Pods:"
                    /opt/homebrew/bin/kubectl get pods

                    echo "Services:"
                    /opt/homebrew/bin/kubectl get services

                    echo "Deployed application image:"
                    /opt/homebrew/bin/kubectl get deployment campusconnect-app \
                    -o jsonpath='{.spec.template.spec.containers[0].image}'
                    echo ""

                    APP_IP=$(/opt/homebrew/bin/kubectl get service campusconnect-service \
                    -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

                    echo "CampusConnect URL: http://${APP_IP}"

                    i=1
                    while [ "$i" -le 12 ]; do
                        if curl -fsS --max-time 10 \
                        "http://${APP_IP}/" -o /dev/null; then
                            echo "Application endpoint is accessible."
                            exit 0
                        fi

                        echo "Waiting for application endpoint..."
                        sleep 10
                        i=$((i + 1))
                    done

                    echo "Application endpoint verification failed."
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'CampusConnect Azure CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'CampusConnect pipeline failed. Check the console output.'
        }
    }
}
