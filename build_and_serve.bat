@echo off
echo 清理和准备目录...
if exist "backend\frontend_build" rmdir /s /q backend\frontend_build
mkdir backend\frontend_build

echo 构建前端应用...
cd frontend
call npm run build
cd ..

echo 复制构建文件到后端...
xcopy /E /I /Y frontend\build\* backend\frontend_build\

echo 启动Django服务器...
cd backend
python manage.py runserver

echo 完成！ 