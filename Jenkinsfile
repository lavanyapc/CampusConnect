
pipeline {
    agent any

    environment {
        DB_URL = 'jdbc:postgresql://localhost:5432/campusconnect'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                sh '/opt/homebrew/bin/docker build -t lavanyapc/campusconnect:${BUILD_NUMBER} .'
                sh '/opt/homebrew/bin/docker tag lavanyapc/campusconnect:${BUILD_NUMBER} lavanyapc/campusconnect:latest'
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
                    sh 'echo "$DOCKERHUB_TOKEN" | /opt/homebrew/bin/docker login -u "$DOCKERHUB_USERNAME" --password-stdin'
                    sh '/opt/homebrew/bin/docker push lavanyapc/campusconnect:${BUILD_NUMBER}'
                    sh '/opt/homebrew/bin/docker push lavanyapc/campusconnect:latest'
                    sh '/opt/homebrew/bin/docker logout'
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

