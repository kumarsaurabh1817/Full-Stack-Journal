# Full Stack Journal 📓

A full-stack journal application that allows users to create, read, update, and delete personal journal entries. The project is split into a React frontend and a Node.js/Express backend.

## Project Structure

- `frontend/` - React application initialized with Vite.
- `backend/` - Node.js/Express backend providing RESTful APIs.

## Features

- **User Authentication:** Secure registration and login functionalities.
- **Journal Management:** Create, view, update, and securely delete journal entries.
- **Responsive UI:** Clean frontend views for login, registration, and dashboard using modern React practices.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB database (local instance or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (make sure it's untracked by git) and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
