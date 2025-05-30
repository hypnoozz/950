# Gym Management System

> **Recommended Python version: 3.11 or 3.12**  
> Python 3.13 may cause dependency installation issues (e.g., Pillow).

A comprehensive gym management system with user authentication, course management, and order processing.

## Prerequisites

- Python 3.x
- Node.js and npm
- MySQL (optional, SQLite is used by default)

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

## Quick Start

### For Mac/Linux Users
```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### For Windows Users
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
6. Start the development server

Once complete, the application will be running at http://localhost:8000

## Project Structure

```
├── backend/                 # Django backend
│   ├── gym_api/            # Main Django project
│   │   ├── users/         # User management
│   │   ├── courses/       # Course management
│   │   ├── orders/        # Order processing
│   │   ├── auth/          # Authentication
│   │   └── common/        # Common utilities
│   ├── gym_project/       # Django project settings
│   ├── static/            # Static files
│   ├── templates/         # HTML templates
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── utils/       # Utility functions
│   └── package.json     # Node.js dependencies
├── setup.sh             # Setup script for Mac/Linux
└── setup.bat            # Setup script for Windows
```

## Features

- User authentication and authorization
- Course management and scheduling
- Membership plan management
- Order processing
- User profile management
- Responsive frontend design
- Admin dashboard

## Development

### Backend Development
```bash
cd backend
python manage.py runserver
```

### Frontend Development
```bash
cd frontend
npm start
```

## Database

By default, the application uses SQLite for development and testing. For production, configure MySQL in your environment variables.

## Testing

Run the tests using:
```bash
cd backend
python manage.py test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
