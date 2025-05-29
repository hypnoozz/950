import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Modal, Form, Select } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  
  // 模态框状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users/', { params: { search } });
      setUsers(res.data.results || res.data); // 兼容分页和非分页
    } catch (e) {
      message.error('Failed to fetch user list');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search]);

  // 删除用户
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}/`);
      message.success('Delete user successfully');
      fetchUsers();
    } catch {
      message.error('Delete user failed');
    }
  };
  
  // 打开创建用户模态框
  const showCreateModal = () => {
    setModalTitle('Add User');
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // 打开编辑用户模态框
  const showEditModal = (user) => {
    setModalTitle('Edit User');
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role || 'member',
      // 不设置密码字段，因为我们不会展示原密码
    });
    setIsModalVisible(true);
  };
  
  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // 处理模态框确认
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (editingUser) {
        // 更新用户
        await axios.put(`/api/auth/admin/users/update/${editingUser.id}/`, values);
        message.success('Update user successfully');
      } else {
        // 创建用户
        await axios.post('/api/auth/admin/users/create/', values);
        message.success('Create user successfully');
      }
      
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error(
        error.response?.data?.error || 
        (editingUser ? 'Update user failed' : 'Create user failed')
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role || 'Member',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary" 
            ghost
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>User Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search user..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Add User
        </Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      {/* 用户表单模态框 */}
      <Modal
        title={modalTitle}
        open={isModalVisible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="user_form"
          initialValues={{ role: 'member' }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email format' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { 
                required: !editingUser, 
                message: 'Please enter password' 
              },
              { 
                min: 6, 
                message: 'Password must be at least 6 characters',
                validator: (_, value) => {
                  if (editingUser && !value) return Promise.resolve();
                  if (value && value.length < 6) return Promise.reject(new Error('Password must be at least 6 characters'));
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.Password placeholder={editingUser ? 'Leave blank to keep current password' : ''} />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Option value="member">Member</Option>
              <Option value="staff">Instructor</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUserPage; 