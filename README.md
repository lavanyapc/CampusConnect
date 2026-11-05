# CampusConnect – Smart Campus Notice Board

## Project Overview

CampusConnect is a web-based campus notice board that allows users to publish, view and delete announcements. It provides a centralized platform for sharing campus-related information.

## Features

- View campus announcements.
- Publish new announcements.
- Delete existing announcements.
- Store announcements in a PostgreSQL database.
- Responsive web interface.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Java 17, Spring Boot |
| Frontend | HTML, CSS, JavaScript |
| Database | PostgreSQL |
| ORM | Spring Data JPA |
| Build Tool | Maven |
| Containerization | Docker |
| Version Control | Git and GitHub |
| CI/CD | Jenkins |
| Orchestration | Kubernetes |

## Architecture

The frontend communicates with the Spring Boot REST API. The backend uses Spring Data JPA to store and retrieve announcements from PostgreSQL.

## REST API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/notices | Retrieve announcements |
| POST | /api/notices | Create an announcement |
| DELETE | /api/notices/{id} | Delete an announcement |

## Running Locally

1. Start PostgreSQL.
2. Configure the database connection using environment variables if required.
3. Run the application:

   `./mvnw spring-boot:run`

4. Open `http://localhost:8081`.

## Testing

Run automated tests using:

`./mvnw clean test`

## DevOps Implementation

The project is being configured for Docker containerization, Jenkins-based CI/CD automation, Docker image publishing and Kubernetes deployment.
