import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Modal, Form, Select, DatePicker, Tag, Switch } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const MemberManagementPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  
  // 添加分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState([]);

  // Fetch member list
  const fetchMembers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users/', { 
        params: { 
          search,
          role: 'member',
          page,
          page_size: pageSize
        } 
      });
      
      // 处理分页数据
      if (res.data && res.data.results) {
        setMembers(res.data.results);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: res.data.count || 0
        });
      } else if (Array.isArray(res.data)) {
        // 兼容非分页响应
        setMembers(res.data);
        setPagination({
          ...pagination,
          total: res.data.length
        });
      }
    } catch (e) {
      console.error('Failed to get member list:', e);
      message.error('Failed to get member list');
    }
    setLoading(false);
  };

  // 处理分页变化
  const handleTableChange = (pagination) => {
    fetchMembers(pagination.current, pagination.pageSize);
  };

  // Fetch membership plans
  const fetchMembershipPlans = async () => {
    try {
      const res = await axios.get('/api/orders/membership-plans/');
      const plansData = Array.isArray(res.data) ? res.data : 
                       (res.data.results ? res.data.results : []);
      setMembershipPlans(plansData);
    } catch (e) {
      console.error('Failed to get membership plans:', e);
      message.error('Failed to get membership plans');
    }
  };

  useEffect(() => {
    fetchMembers(pagination.current, pagination.pageSize);
    fetchMembershipPlans();
    // eslint-disable-next-line
  }, [search]);

  // Delete member
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}/`);
      message.success('Member deleted successfully');
      fetchMembers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete member:', error);
      message.error('Failed to delete member');
    }
  };
  
  // Show create modal
  const showCreateModal = () => {
    setModalTitle('Add Member');
    setEditingMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // Show edit modal
  const showEditModal = (member) => {
    setModalTitle('Edit Member');
    setEditingMember(member);
    
    form.setFieldsValue({
      username: member.username,
      email: member.email,
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      phone: member.phone || '',
      membership_plan_id: member.membership_plan_id,
      start_date: member.membership_start ? moment(member.membership_start) : null,
      end_date: member.membership_end ? moment(member.membership_end) : null,
      status: member.membership_status || 'active',
      is_active: member.is_active !== false,
    });
    
    setIsModalVisible(true);
  };

  // Show detail modal
  const showDetailModal = (member) => {
    setViewingMember(member);
    setIsDetailModalVisible(true);
  };
  
  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle detail modal cancel
  const handleDetailCancel = () => {
    setIsDetailModalVisible(false);
  };
  
  // Handle modal confirm
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // Convert date format
      if (values.start_date) {
        values.membership_start = values.start_date.format('YYYY-MM-DD');
        delete values.start_date;
      }
      if (values.end_date) {
        values.membership_end = values.end_date.format('YYYY-MM-DD');
        delete values.end_date;
      }
      
      // Ensure user role is member
      values.role = 'member';
      
      // Convert membership status
      if (values.status) {
        values.membership_status = values.status;
        delete values.status;
      }
      
      if (editingMember) {
        // Update member
        await axios.put(`/api/users/${editingMember.id}/`, values);
        message.success('Member updated successfully');
      } else {
        // Create member (requires password)
        if (!values.password) {
          message.error('Please set a password');
          setConfirmLoading(false);
          return;
        }
        await axios.post('/api/users/', values);
        message.success('Member created successfully');
      }
      
      setIsModalVisible(false);
      fetchMembers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Form submission failed:', error);
      message.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Get member status tag
  const getMemberStatusTag = (status, endDate) => {
    const now = moment();
    const end = moment(endDate);
    
    if (status === 'expired' || (endDate && end.isBefore(now))) {
      return <Tag color="red">Expired</Tag>;
    }
    
    if (status === 'active') {
      return <Tag color="green">Active</Tag>;
    }
    
    if (status === 'suspended') {
      return <Tag color="orange">Suspended</Tag>;
    }
    
    if (status === 'cancelled') {
      return <Tag color="volcano">Cancelled</Tag>;
    }
    
    return <Tag color="default">Unknown</Tag>;
  };

  const columns = [
    {
      title: 'No.',
      key: 'index',
      width: 80,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
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
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.email || '-'}</div>
          <div>{record.phone || '-'}</div>
        </div>
      )
    },
    {
      title: 'Membership Plan',
      dataIndex: 'membership_plan_name',
      key: 'membership_plan_name',
      render: (plan, record) => plan || record.membership_plan_name || '-',
    },
    {
      title: 'Start Date',
      dataIndex: 'membership_start',
      key: 'membership_start',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'End Date',
      dataIndex: 'membership_end',
      key: 'membership_end',
      render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getMemberStatusTag(record.membership_status, record.membership_end),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => showDetailModal(record)}
          >
            Details
          </Button>
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
            title="Are you sure you want to delete this member?"
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
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Member Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search members..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />
        <Select 
          placeholder="Status Filter"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => setSearch(value || '')}
        >
          <Option value="active">Active</Option>
          <Option value="expired">Expired</Option>
          <Option value="suspended">Suspended</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Add Member
        </Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={members}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      
      {/* Member Form Modal */}
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
          name="member_form"
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
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input className="text-gray-900" />
            </Form.Item>
          </div>
          
          {!editingMember && (
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
            name="membership_plan_id"
            label="Membership Plan"
            rules={[{ required: true, message: 'Please select a membership plan' }]}
          >
            <Select
              placeholder="Select membership plan"
              className="text-gray-900"
            >
              {membershipPlans.map(plan => (
                <Option key={plan.id} value={plan.id}>{plan.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="start_date"
              label="Start Date"
              rules={[{ required: true, message: 'Please select start date' }]}
            >
              <DatePicker 
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="end_date"
              label="End Date"
              rules={[{ required: true, message: 'Please select end date' }]}
            >
              <DatePicker 
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="status"
              label="Membership Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select className="text-gray-900">
                <Option value="active">Active</Option>
                <Option value="expired">Expired</Option>
                <Option value="suspended">Suspended</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="is_active"
              label="Account Status"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Enabled" 
                unCheckedChildren="Disabled" 
                defaultChecked
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Member Detail Modal */}
      <Modal
        title="Member Details"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        footer={[
          <Button key="back" onClick={handleDetailCancel}>
            Close
          </Button>
        ]}
        width={600}
      >
        {viewingMember && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Member ID</p>
              <p className="font-medium">{viewingMember.id}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Username</p>
              <p className="font-medium">{viewingMember.username || '-'}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Name</p>
              <p className="font-medium">
                {[viewingMember.first_name, viewingMember.last_name].filter(Boolean).join(' ') || '-'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium">{viewingMember.email || '-'}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Phone</p>
              <p className="font-medium">{viewingMember.phone || '-'}</p>
            </div>
            
            <div className="col-span-2 mt-6">
              <h3 className="text-lg font-medium mb-4">Membership Information</h3>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Membership Plan</p>
              <p className="font-medium">
                {viewingMember.membership_plan_name || '-'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Status</p>
              <p className="font-medium">
                {getMemberStatusTag(viewingMember.membership_status, viewingMember.membership_end)}
              </p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Start Date</p>
              <p className="font-medium">
                {viewingMember.membership_start ? moment(viewingMember.membership_start).format('YYYY-MM-DD') : '-'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">End Date</p>
              <p className="font-medium">
                {viewingMember.membership_end ? moment(viewingMember.membership_end).format('YYYY-MM-DD') : '-'}
              </p>
            </div>
            
            <div className="col-span-2 mt-6">
              <h3 className="text-lg font-medium mb-4">Purchase History</h3>
              <p className="text-gray-500">
                {/* Purchase history list can be added here when backend API is ready */}
                No purchase history available
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MemberManagementPage; 