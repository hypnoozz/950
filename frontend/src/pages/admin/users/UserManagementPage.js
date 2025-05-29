import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Modal, Form, Select, Switch } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch user list
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Exclude members and instructors, only get normal users and admins
      const res = await axios.get('/api/users/', { 
        params: { 
          search,
          exclude_roles: 'member,staff' // Exclude members and instructors
        } 
      });
      const usersData = Array.isArray(res.data) ? res.data : 
                       (res.data.results ? res.data.results : []);
      setUsers(usersData);
    } catch (e) {
      console.error('Failed to fetch user list:', e);
      message.error('Failed to fetch user list');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search]);

  // Delete user
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}/`);
      message.success('Delete user successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete user failed:', error);
      message.error('Delete user failed');
    }
  };
  
  // Open create user modal
  const showCreateModal = () => {
    setModalTitle('Add User');
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // Open edit user modal
  const showEditModal = (user) => {
    setModalTitle('Edit User');
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      is_active: user.is_active !== false,
    });
    setIsModalVisible(true);
  };
  
  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // Handle modal confirm
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (editingUser) {
        // Update user
        await axios.put(`/api/users/${editingUser.id}/`, values);
        message.success('Update user successfully');
      } else {
        // Create user (ensure password is set)
        if (!values.password) {
          message.error('Please set password');
          setConfirmLoading(false);
          return;
        }
        await axios.post('/api/users/', values);
        message.success('Create user successfully');
      }
      
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Submit form failed:', error);
      message.error(error.response?.data?.error || 'Operation failed');
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
      title: 'Name',
      key: 'name',
      render: (_, record) => {
        const fullName = [record.first_name, record.last_name].filter(Boolean).join(' ');
        return fullName || '-';
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          'admin': 'Admin',
          'staff': 'Instructor',
          'member': 'Member',
          'user': 'User'
        };
        return roleMap[role] || role;
      }
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span className={`px-2 py-1 rounded-full text-xs ${isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isActive !== false ? 'Active' : 'Inactive'}
        </span>
      )
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
        <Select 
          placeholder="Role filter"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => setSearch(value || '')}
        >
          <Option value="admin">Admin</Option>
          <Option value="user">User</Option>
        </Select>
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
      
      {/* User form modal */}
      <Modal
        title={modalTitle}
        open={isModalVisible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="user_form"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter username' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]}
            >
              <Input className="text-gray-900" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input className="text-gray-900" />
            </Form.Item>
          </div>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password className="text-gray-900" />
            </Form.Item>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="first_name"
              label="First Name"
            >
              <Input className="text-gray-900" />
            </Form.Item>
            
            <Form.Item
              name="last_name"
              label="Last Name"
            >
              <Input className="text-gray-900" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input className="text-gray-900" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[
              { required: true, message: 'Please select a role' }
            ]}
          >
            <Select className="text-gray-900">
              <Option value="admin">Admin</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="is_active"
            label="Account Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive" 
              defaultChecked
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage; 