# Testing Documentation

This directory contains all testing-related documentation for the Gym Management System.

## Contents

- [Test Cases](testcases.md) - Detailed test cases and results
- [Test Reports](../test_reports/) - Generated test reports (HTML/JSON)

## Running Tests

### Backend Tests
```bash
cd backend
python manage.py test
```

## Test Structure

1. **Authentication Tests**
   - Login/Registration
   - Password Management
   - Token Validation

2. **User Management Tests**
   - Profile Management
   - Permission Control
   - Admin Functions

3. **Feature Status**
   - Completed Features
   - In Progress Features
   - Planned Features

## Test Reports

Test reports are automatically generated in the `backend/test_reports` directory after running tests. They include:
- Test results summary
- Feature status
- Detailed test cases
- Error logs (if any) 