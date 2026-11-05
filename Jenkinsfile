
pipeline {
    agent any

    environment {
        DB_URL = 'jdbc:postgresql://localhost:5432/campusconnect'
        PATH = "/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/local/bin:${env.PATH}"
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
                    string(credentialsId: 'campus-db-username', variable: 'DB_USERNAME'),
                    string(credentialsId: 'campus-db-password', variable: 'DB_PASSWORD')
                ]) {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Test') {
            steps {
                withCredentials([
                    string(credentialsId: 'campus-db-username', variable: 'DB_USERNAME'),
                    string(credentialsId: 'campus-db-password', variable: 'DB_PASSWORD')
                ]) {
                    sh './mvnw test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '/usr/local/bin/docker build -t lavanyapc/campusconnect:${BUILD_NUMBER} .'
                sh '/usr/local/bin/docker tag lavanyapc/campusconnect:${BUILD_NUMBER} lavanyapc/campusconnect:latest'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | /usr/local/bin/docker login \
                        -u "$DOCKERHUB_USERNAME" --password-stdin
                    '''
                    sh '/usr/local/bin/docker push lavanyapc/campusconnect:${BUILD_NUMBER}'
                    sh '/usr/local/bin/docker push lavanyapc/campusconnect:latest'
                    sh '/usr/local/bin/docker logout'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '/opt/homebrew/bin/kubectl apply -f k8s/database.yaml'
                sh '/opt/homebrew/bin/kubectl apply -f k8s/database-service.yaml'
                sh '/opt/homebrew/bin/kubectl apply -f k8s/deployment.yaml'
                sh '/opt/homebrew/bin/kubectl apply -f k8s/service.yaml'

                sh '/opt/homebrew/bin/kubectl set image deployment/campusconnect-app campusconnect=lavanyapc/campusconnect:${BUILD_NUMBER}'

                sh '/opt/homebrew/bin/kubectl rollout status deployment/campusconnect-app --timeout=180s'
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '/opt/homebrew/bin/kubectl get deployments'
                sh '/opt/homebrew/bin/kubectl get pods'
                sh '/opt/homebrew/bin/kubectl get services'
            }
        }
    }

    post {
        success {
            echo 'CampusConnect pipeline completed successfully!'
        }

        failure {
            echo 'CampusConnect pipeline failed. Check the console output.'
        }
    }
}
