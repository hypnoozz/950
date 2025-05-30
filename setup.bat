@echo off
echo === Gym Management System Setup ===

REM Check for required dependencies
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python is required but not installed. Please install Python.
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is required but not installed. Please install Node.js and npm.
    exit /b 1
)

REM Create and activate virtual environment
echo Setting up Python virtual environment...
python -m venv venv
call venv\Scripts\activate

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
npm install

REM Build the frontend application
echo Building the frontend application...
npm run build

REM Set up the database
echo Setting up the database...
cd ..\backend
python manage.py migrate

REM Run tests and generate reports
echo Running backend tests and generating reports...
python manage.py test > test_reports\backend_output.txt 2>&1

echo Running frontend tests and generating reports...
cd ..\frontend
npm test -- --watchAll=false > test_reports\frontend_output.txt 2>&1

REM Start the development server
echo Starting the development server...
cd ..\backend
python manage.py runserver

echo Setup complete! The application should now be running at http://localhost:8000 