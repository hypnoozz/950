# Test Documentation

This directory contains test documentation and reports for the Gym Management System.

## Directory Structure

```
test/
├── test_reports/     # Generated test reports
└── README.md        # This file
```

## Running Tests

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

## Test Reports

Test reports are generated in the `test_reports/` directory after running the tests. These reports include:
- Test coverage reports
- Test execution results
- Performance metrics

## Test Cases

Test cases are documented in the following locations:
- Backend: Each Django app's `tests.py` file
- Frontend: Component-level `.test.js` files 