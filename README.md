# Natours Backend API

Welcome to the Natours Backend API! This backend application serves as the heart of the Natours nature tour booking system. It provides the necessary endpoints for managing tours, users, bookings, and more. Power your frontend applications with this robust API and offer users an exceptional booking experience.

- [Natours Backend API](#natours-backend-api)
  - [Description](#description)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Installation](#installation)
  - [API Documentation](#api-documentation)
  - [Acknowledgments](#acknowledgments)

## Description

Natours Backend API is the foundation of the Natours application, responsible for handling data related to nature tours, user accounts, bookings, and more. It follows RESTful principles and provides endpoints for CRUD (Create, Read, Update, Delete) operations on different resources. This API is designed to be scalable and maintainable, making it an ideal backend solution for any tour booking application.

## Features

- Manage tours, including creating, reading, updating, and deleting.
- User authentication and authorization for secure access to endpoints.
- Handle user registrations, logins, and profile management.
- Booking system for users to reserve tours.
- Data validation and error handling to ensure reliable operations.

## Technologies Used

- Node.js and Express for building the backend server.
- MongoDB for the database, storing tour, user, and booking data.
- Mongoose as an Object Data Modeling (ODM) library for MongoDB.
- JWT for user authentication and authorization.
- Pug as a template engine

## Installation

- **Clone the repository:**
  ```bash
  $ git clone https://github.com/MohamedAboElnaser/Natours-app.git
  $ cd Natours-app
  ```
- **Install dependencies:**
  ```bash
   $ npm install
  ```
- **Set up environment variables:**
  Create a .env file in the root directory and add the following:
  **_you need to set all varables needed :_**
  - NODE_ENV
  - PORT
  - DATABASE_PASSWORD
  - DATABASE
  - DATABASE_LOCAL
  - JWT_SECRET
  - EMAIL_USERNAME
  - EMAIL_PASSWORD
  - EMAIL_PORT=587
  - EMAIL_HOST=sandbox.smtp.mailtrap.io
  - COOKI_EXPIRES_IN
  - EMAIL_FROM
  - STRIP_SECRET_KEY
  - STRIP_WEBHOOK_SECRET
- **Start the development server**:
  - **_Development_**
    - run this command
      ```bash
      npm start
      ```
  - **_Production_**
    - run this command
      ```bash
      npm run start:prod
      ```

## API Documentation

For details on available endpoints and how to interact with the API, refer to the
[API Documentation](https://mohamedaboelnaser.github.io/natours-api-documentation/)
and replace the URL with ***https://natours-app-9jag.onrender.com/***

## Acknowledgments

Special thanks to [Jonas](https://github.com/jonasschmedtmann/complete-node-bootcamp) for providing the course materials and guidance for building this application .
