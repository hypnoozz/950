import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Modal, Form, DatePicker, Select, Upload, Avatar, Image } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

// 生成一个负数的临时ID，避免与后端真实ID冲突
const generateTempId = () => {
  return -Math.floor(Math.random() * 1000000) - 1; // 生成一个负的随机整数
};

const InstructorManagementPage = () => {
  const { t, i18n } = useTranslation();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  
  // 图片上传相关状态
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tempId, setTempId] = useState(0); // 临时ID，用于新增时关联图片
  
  // 模态框状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 获取教练列表
  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users/instructors/', { params: { search } });
      const instructorsData = Array.isArray(res.data) ? res.data : 
                             (res.data.results ? res.data.results : []);
      
      // 获取教练数据，并处理头像URL
      const instructorsWithAvatars = instructorsData.map(instructor => {
        console.log('教练数据:', instructor);
        // 如果有avatar字段，直接使用
        if (instructor.avatar) {
          return {
            ...instructor,
            avatar_url: instructor.avatar // 为了兼容现有代码，保留avatar_url字段
          };
        }
        return instructor;
      });
      
      setInstructors(instructorsWithAvatars);
    } catch (e) {
      console.error('Failed to get instructor list:', e);
      message.error('Failed to get instructor list');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstructors();
    // eslint-disable-next-line
  }, [search]);

  // 删除教练
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/instructors/${id}/`);
      message.success('Instructor deleted successfully');
      fetchInstructors();
    } catch {
      message.error('删除教练失败');
    }
  };
  
  // 打开创建教练模态框
  const showCreateModal = () => {
    setModalTitle('Add Instructor');
    setEditingInstructor(null);
    form.resetFields();
    setAvatarUrl('');
    setFileList([]);
    // 生成一个负数的临时ID，避免与后端ID冲突
    const newTempId = generateTempId();
    setTempId(newTempId);
    setIsModalVisible(true);
  };
  
  // 打开编辑教练模态框
  const showEditModal = (instructor) => {
    setModalTitle('Edit Instructor');
    setEditingInstructor(instructor);
    setTempId('');
    
    form.setFieldsValue({
      username: instructor.username,
      email: instructor.email,
      first_name: instructor.first_name || '',
      last_name: instructor.last_name || '',
      phone: instructor.phone || '',
      gender: instructor.gender || '',
      birth_date: instructor.birth_date ? dayjs(instructor.birth_date) : null,
    });
    
    // 设置头像 - 优先使用avatar字段，兼容avatar_url
    const avatarSrc = instructor.avatar || instructor.avatar_url;
    if (avatarSrc) {
      setAvatarUrl(avatarSrc);
      setFileList([
        {
          uid: '-1',
          name: 'avatar.png',
          status: 'done',
          url: avatarSrc,
        },
      ]);
    } else {
      setAvatarUrl('');
      setFileList([]);
    }
    
    setIsModalVisible(true);
  };
  
  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // 处理头像上传
  const handleAvatarChange = (info) => {
    // 设置文件列表
    setFileList(info.fileList);
    
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setUploading(false);
      // 检查响应中是否有file_url字段
      if (info.file.response && info.file.response.file_url) {
        setAvatarUrl(info.file.response.file_url);
      } else if (info.file.response) {
        // 如果没有file_url但有响应，可能需要手动构建URL
        console.log('上传响应:', info.file.response);
        // 尝试使用ID构建URL
        if (info.file.response.id) {
          const imageUrl = `/api/uploads/images/${info.file.response.id}/preview/`;
          setAvatarUrl(imageUrl);
        }
      }
    } else if (info.file.status === 'error') {
      setUploading(false);
      message.error('头像上传失败');
    }
  };
  
  // 自定义上传函数
  const customUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('image', file);
    // 添加业务类型和ID
    formData.append('business_type', 'user'); // 修改为user类型
    // 使用整数类型的ID
    const businessId = editingInstructor ? editingInstructor.id : tempId;
    formData.append('business_id', businessId);
    
    try {
      console.log('开始上传头像，业务ID:', businessId);
      const res = await axios.post('/api/uploads/images/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('上传成功，响应:', res.data);
      // 手动添加status字段
      const responseWithStatus = {
        ...res.data,
        status: 'done'
      };
      onSuccess(responseWithStatus, file);
    } catch (error) {
      console.error('上传头像失败:', error);
      onError(error);
    }
  };
  
  // 处理模态框确认
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      setConfirmLoading(true);
      
      // 从上传列表中获取头像URL
      if (fileList && fileList.length > 0 && fileList[0].response) {
        const avatarFileUrl = fileList[0].response.file_url;
        if (avatarFileUrl) {
          console.log('添加头像URL到表单:', avatarFileUrl);
          values.avatar = avatarFileUrl;
        }
      } else if (avatarUrl) {
        // 如果没有新上传的图片但有已设置的avatarUrl，也添加到表单
        values.avatar = avatarUrl;
      }
      
      let instructorId;
      
      if (editingInstructor) {
        // 更新教练 - 使用FormData
        const formData = new FormData();
        
        // 添加所有字段到FormData
        Object.keys(values).forEach(key => {
          // 处理日期字段
          if (key === 'birth_date' && values[key]) {
            formData.append(key, values[key].format('YYYY-MM-DD'));
          } else if (values[key] !== undefined && values[key] !== null) {
            formData.append(key, values[key]);
          }
        });
        
        console.log('更新教练数据:', Object.fromEntries(formData));
        
        const updateRes = await axios.put(
          `/api/users/instructors/${editingInstructor.id}/`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        instructorId = editingInstructor.id;
        message.success('Instructor updated successfully');
      } else {
        // 创建教练（确保设置了密码）
        if (!values.password) {
          message.error('Please set password');
          setConfirmLoading(false);
          return;
        }
        
        // 使用FormData创建教练
        const formData = new FormData();
        
        // 添加所有字段到FormData
        Object.keys(values).forEach(key => {
          // 处理日期字段
          if (key === 'birth_date' && values[key]) {
            formData.append(key, values[key].format('YYYY-MM-DD'));
          } else if (values[key] !== undefined && values[key] !== null) {
            formData.append(key, values[key]);
          }
        });
        
        console.log('创建教练数据:', Object.fromEntries(formData));
        
        const createRes = await axios.post(
          '/api/users/instructors/create/', 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        instructorId = createRes.data.id;
        message.success('Instructor created successfully');
      }
      
      setIsModalVisible(false);
      fetchInstructors();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error(error.response?.data?.error || '操作失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: 'Avatar',
      key: 'avatar',
      render: (_, record) => (
        <Avatar 
          size={40} 
          src={record.avatar || record.avatar_url}
          icon={!record.avatar && !record.avatar_url && <UserOutlined />} 
        />
      )
    },
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
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => {
        if (!gender) return '-';
        const genderMap = {
          'male': 'Male',
          'female': 'Female',
          'other': 'Other'
        };
        return genderMap[gender] || gender;
      }
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
            title="Are you sure you want to delete this instructor?"
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
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Instructor Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search instructors..."
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
          Add Instructor
        </Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={instructors}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      {/* 教练表单模态框 */}
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
          name="instructor_form"
        >
          {/* 头像上传 */}
          <Form.Item
            label="Avatar"
            name="avatar"
          >
            <div className="flex items-center">
              <Avatar 
                size={64} 
                src={avatarUrl}
                icon={!avatarUrl && <UserOutlined />}
                className="mr-4"
              />
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                fileList={fileList}
                onChange={handleAvatarChange}
                customRequest={customUpload}
              >
                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
              </Upload>
            </div>
          </Form.Item>
          
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
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input className="text-gray-900" />
            </Form.Item>
          </div>
          
          {!editingInstructor && (
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
          
          <div className="grid grid-cols-2 gap-4">
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
              name="gender"
              label="Gender"
            >
              <Select className="text-gray-900">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="birth_date"
            label="Birth Date"
          >
            <DatePicker className="w-full text-gray-900" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InstructorManagementPage; 