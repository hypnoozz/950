#!/bin/bash

# 构建前端
echo "Building React frontend..."
cd frontend
npm run build
cd ..

# 创建目标目录
echo "Creating frontend_build directory in backend..."
mkdir -p backend/frontend_build

# 复制构建文件
echo "Copying build files to backend/frontend_build..."
cp -r frontend/build/* backend/frontend_build/

echo "Frontend build process completed successfully!"
echo "Now you can run the Django server with: python backend/manage.py runserver" 