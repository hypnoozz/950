# Gym Management System

A comprehensive gym management system built with React and Django.

## Features

- User authentication and authorization
- Member profile management
- Course management and scheduling
- Admin dashboard for staff management

## Tech Stack

### Frontend
- React 18
- Material-UI
- React Router
- Axios
- Redux Toolkit

### Backend
- Django 4.2
- Django REST Framework
- SQLite (default) / MySQL
- JWT Authentication

## Prerequisites

- Node.js 18+
- Python 3.9+

## Installation

### Quick Start

#### For Mac/Linux Users
```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

#### For Windows Users
```bash
# Run the setup script
setup.bat
```

The setup script will:
1. Check for required dependencies
2. Install backend dependencies
3. Install frontend dependencies
4. Build the frontend application
5. Set up the database
6. Run database migrations
7. Collect static files
8. Start the development server

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/hypnoozz/950.git
cd 950
```

2. Set up the frontend:
```bash
cd frontend
npm install --legacy-peer-deps  # Use this flag if you encounter dependency conflicts
```

3. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up the database and static files:
```bash
cd backend
python manage.py migrate  # Create database tables
python manage.py collectstatic --noinput  # Collect static files (CSS, JS, images) - only needed once
```

Once complete, the application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## Running the Application

1. Start the backend server:
```bash
cd backend
python manage.py runserver

2. Start the frontend development server:
```bash
cd frontend
npm start
```

## Port Configuration

The system uses the following ports:
- 3000: Frontend React application (development server)
- 8000: Backend Django server (API and admin interface)

## Testing
### Frontend Tests
- Located in `frontend/src/tests/`
- Run with: `npm test`

### Backend Tests
- Located in `backend/gym_api/tests/`
- Run with: `python manage.py test`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
