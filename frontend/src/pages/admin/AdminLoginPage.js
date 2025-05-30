import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 使用标准登录接口，但添加管理员标识
      const res = await login(values.username, values.password);
      
      // 登录成功后检查用户角色
      if (res && (res.role === 'admin' || res.role === 'staff')) {
        message.success('Login successful');
        navigate('/admin');
      } else {
        // 如果不是管理员角色，显示错误
        message.error('You are not an admin or staff');
        // 清除凭证
        localStorage.removeItem('tokens');
      }
    } catch (e) {
      message.error('Login failed, please check your username and password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card style={{ width: 350 }} className="shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-600 mt-2">Gym Management System Admin</p>
        </div>
        
        <Form name="admin_login" onFinish={onFinish} layout="vertical">
          <Form.Item 
            name="username" 
            rules={[{ required: true, message: 'Please enter your username' }]}
          > 
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item 
            name="password" 
            rules={[{ required: true, message: 'Please enter your password' }]}
          > 
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center">
          <a href="/" className="text-sm text-gray-600">
            Back to Home
          </a>
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginPage; 