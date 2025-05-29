# Gym Management System

## Project Overview
This project is a comprehensive gym management system designed to streamline gym operations and enhance user experience. It includes features for user authentication, member management, trainer management, and course scheduling.

## Features
- **User Authentication:** Login, registration, and password reset functionality.
- **Member Management:** CRUD operations for member profiles and status.
- **Trainer Management:** CRUD operations for trainer information (in progress).
- **Course Management:** Course booking and scheduling (planned).
- **Admin Dashboard:** Overview of users, members, and trainers.

## Technical Stack
- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React, Node.js, Tailwind CSS
- **Database:** PostgreSQL
- **API:** RESTful API with JWT authentication

## Installation and Setup
1. Clone the repository.
2. Create a virtual environment.
3. Install dependencies: `pip install -r requirements.txt`
4. Configure the database.
5. Run migrations: `python manage.py migrate`
6. Start the server: `python manage.py runserver`

## Testing
Run tests using:
```bash
python manage.py test
```
Test reports are generated in the `backend/test_reports` directory.

## Documentation
- **Test Cases:** See `docs/testcases.md` for detailed test cases.
- **User Manual:** See `docs/user_manual.md` for step-by-step instructions.

## Team Contribution
- **Alice:** Frontend, UI/UX, documentation
- **Bob:** Backend, API, database design
- **Carol:** Testing, deployment, reporting

## Challenges and Reflections
- Key issues encountered and resolved.
- Reflection on project progress and future improvements.

## License
This project is licensed under the MIT License. 