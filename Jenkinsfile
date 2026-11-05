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
