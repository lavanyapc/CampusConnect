
pipeline {
    agent any

    environment {
        DB_URL = 'jdbc:postgresql://localhost:5432/campusconnect'
        PATH = "/Applications/Docker.app/Contents/Resources/bin:/usr/local/bin:/opt/homebrew/bin:${env.PATH}"
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

