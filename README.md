# Gym Management System

A comprehensive gym management system built with Django and React.

## Project Structure

```
gym-sys/
├── backend/                 # Django backend
│   ├── gym_api/            # Main application
│   │   ├── users/         # User management
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   └── tests.py
│   │   ├── auth/          # Authentication
│   │   │   ├── views.py
│   │   │   └── tests.py
│   │   ├── courses/       # Course management
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   └── tests.py
│   │   └── utils/         # Utility functions
│   │       └── test_report.py
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/               # React frontend
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   └── __tests__/    # Frontend tests
│   └── package.json       # Node dependencies
├── docs/                  # Documentation
│   ├── test/             # Testing documentation
│   │   ├── README.md     # Test overview
│   │   └── testcases.md  # Detailed test cases
│   ├── api/              # API documentation
│   └── user/             # User documentation
└── README.md             # Project documentation
```

## Key Features

- User Authentication
- Member Management
- Class Scheduling
- Administrative Tasks

## Technology Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, TypeScript
- Database: MySQL
- Testing: pytest (Backend), Jest (Frontend)

## Getting Started

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure database:
```bash
python manage.py migrate
```

4. Run development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm start
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

For detailed test cases and reports, see [Testing Documentation](docs/test/README.md).

## Documentation

- [API Documentation](docs/api/README.md)
- [User Manual](docs/user/README.md)
- [Test Cases](docs/test/testcases.md)

## Team Contributions

- **Team Member 1**: Backend Development, Testing
- **Team Member 2**: Frontend Development, UI/UX
- **Team Member 3**: Database Design, Documentation
- **Team Member 4**: Project Management, Testing

## Challenges and Solutions

1. **Authentication System**
   - Challenge: Implementing secure JWT authentication
   - Solution: Used Django REST framework's JWT implementation

2. **Real-time Updates**
   - Challenge: Managing real-time class schedule updates
   - Solution: Implemented WebSocket connections

3. **Data Consistency**
   - Challenge: Maintaining data integrity across distributed system
   - Solution: Implemented transaction management and validation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
