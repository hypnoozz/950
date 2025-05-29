import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Modal, Form, InputNumber, Select, Switch } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const MembershipPlanManagementPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingPlan, setEditingPlan] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch membership plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders/membership-plans/', { params: { search } });
      const plansData = Array.isArray(res.data) ? res.data : 
                       (res.data.results ? res.data.results : []);
      setPlans(plansData);
    } catch (e) {
      console.error('Failed to get membership plans:', e);
      message.error('Failed to get membership plans');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line
  }, [search]);

  // Delete membership plan
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/orders/membership-plans/${id}/`);
      message.success('Membership plan deleted successfully');
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete membership plan:', error);
      message.error('Failed to delete membership plan');
    }
  };
  
  // Show create modal
  const showCreateModal = () => {
    setModalTitle('Add New Plan');
    setEditingPlan(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // Show edit modal
  const showEditModal = (plan) => {
    setModalTitle('Edit Plan');
    setEditingPlan(plan);
    
    // Ensure benefits is an array
    const benefits = Array.isArray(plan.benefits) ? plan.benefits :
                    typeof plan.benefits === 'string' ? plan.benefits.split(',').map(b => b.trim()) :
                    [];
    
    form.setFieldsValue({
      name: plan.name,
      plan_type: plan.plan_type,
      duration: plan.duration,
      price: plan.price,
      description: plan.description || '',
      benefits: benefits,
      is_active: plan.is_active,
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
      
      if (editingPlan) {
        // Update membership plan
        await axios.put(`/api/orders/membership-plans/${editingPlan.id}/`, values);
        message.success('Membership plan updated successfully');
      } else {
        // Create membership plan
        await axios.post('/api/orders/membership-plans/', values);
        message.success('Membership plan created successfully');
      }
      
      setIsModalVisible(false);
      fetchPlans();
    } catch (error) {
      console.error('Form submission failed:', error);
      message.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Format plan type display
  const formatPlanType = (type) => {
    const planTypes = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly',
      'custom': 'Custom'
    };
    return planTypes[type] || type;
  };

  const columns = [
    {
      title: 'Plan Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Plan Type',
      dataIndex: 'plan_type',
      key: 'plan_type',
      render: (type) => formatPlanType(type)
    },
    {
      title: 'Duration (Days)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Price (¥)',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isActive ? 'Active' : 'Inactive'}
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
            title="Are you sure you want to delete this membership plan?"
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
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Membership Plan Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search plans..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />
        <Select 
          placeholder="Plan Type"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => setSearch(value || '')}
        >
          <Option value="monthly">Monthly</Option>
          <Option value="quarterly">Quarterly</Option>
          <Option value="yearly">Yearly</Option>
          <Option value="custom">Custom</Option>
        </Select>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Add Plan
        </Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={plans}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      {/* Add/Edit Plan Modal */}
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
          name="plan_form"
        >
          <Form.Item
            name="name"
            label="Plan Name"
            rules={[{ required: true, message: 'Please enter plan name' }]}
          >
            <Input className="text-gray-900" />
          </Form.Item>

          <Form.Item
            name="plan_type"
            label="Plan Type"
            rules={[{ required: true, message: 'Please select plan type' }]}
          >
            <Select className="text-gray-900">
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
              <Option value="yearly">Yearly</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (Days)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (¥)"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber min={0} step={0.01} className="w-full" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} className="text-gray-900" />
          </Form.Item>

          <Form.Item
            name="benefits"
            label="Benefits"
            rules={[{ required: true, message: 'Please enter benefits' }]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Enter benefits (press enter to add)"
              className="text-gray-900"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
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

export default MembershipPlanManagementPage; 