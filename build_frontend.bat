@echo off
echo Building React frontend...
cd frontend
call npm run build
cd ..

echo Creating frontend_build directory in backend...
if not exist "backend\frontend_build" mkdir backend\frontend_build

echo Copying build files to backend\frontend_build...
xcopy /E /I /Y frontend\build\* backend\frontend_build\

echo Frontend build process completed successfully!
echo Now you can run the Django server with: python backend\manage.py runserver 