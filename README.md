# Nodejsmon Backend


Nodejsmon is the backend service for the Reactmon game, providing a robust API built with Node.js and MongoDB. This project demonstrates modern backend development practices, including containerization with Docker and environment-based configuration.

## 🚀 Features

- RESTful API for Pokémon game mechanics
- User authentication and authorization
- Database integration with MongoDB
- Dockerized for easy deployment and scaling

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Docker
- JWT for authentication

## 🏗️ Setup

1. Clone this repository
2. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```
3. Fill in the `.env` file with your specific details. Here's an example:
   ```
   DB_PORT=32964
   DB_NAME=nodejsmon
   DB_HOST=mongo_nodejsmon
   APP_PORT=3006
   JWT_SECRET=your_secret_key_here
   FRONTEND_URL=http://localhost:5173
   FRONTEND_TEST_URL=http://localhost:5173
   MAX_POKEMON=151
   ```
4. Build and run the Docker containers:
   ```
   docker-compose up --build
   ```

The API should now be running and accessible at `http://localhost:3006` (or whichever port you specified in `APP_PORT`).

## 🌐 API Endpoints

For a complete list of available API endpoints, please check the `routes` directory in the project repository. This directory contains all the defined routes and their corresponding handlers.

## 🔐 Environment Variables

- `DB_PORT`: The port for the MongoDB container
- `DB_NAME`: The name of the MongoDB database
- `DB_HOST`: The hostname for the MongoDB container
- `APP_PORT`: The port on which the Node.js app will run
- `JWT_SECRET`: Secret key for JWT token generation
- `FRONTEND_URL`: URL of the frontend application
- `FRONTEND_TEST_URL`: URL for frontend testing
- `MAX_POKEMON`: Maximum number of Pokémon in the game

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/LdMe/nodejsmon/issues).

## 📦 Deployment

This application is containerized using Docker, making it easy to deploy to various cloud platforms or your own infrastructure.

## 📬 Contact

If you have any questions about the project or would like to connect, feel free to reach out:

- LinkedIn: https://www.linkedin.com/in/danel-lafuente/
- Portfolio: https://lafuentedanel.com
- Reactmon GitHub: https://github.com/LdMe/reactmon
---

Happy coding and may your servers always be up! 🎉