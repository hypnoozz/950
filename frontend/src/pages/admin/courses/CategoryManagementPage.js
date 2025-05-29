import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Modal, Form } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const CategoryManagementPage = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  
  // 模态框状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Get category list
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/courses/categories/', { params: { search } });
      const categoriesData = Array.isArray(res.data) ? res.data : 
                           (res.data.results ? res.data.results : []);
      setCategories(categoriesData);
    } catch (e) {
      message.error('Failed to fetch course categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [search]);

  // Delete category
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/courses/categories/${id}/`);
      message.success('Category deleted successfully');
      fetchCategories();
    } catch {
      message.error('Failed to delete category');
    }
  };
  
  // Open create category modal
  const showCreateModal = () => {
    setModalTitle('Add Category');
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  // Open edit category modal
  const showEditModal = (category) => {
    setModalTitle('Edit Category');
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || '',
    });
    setIsModalVisible(true);
  };
  
  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // Handle modal confirmation
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (editingCategory) {
        // Update category
        await axios.put(`/api/courses/categories/${editingCategory.id}/`, values);
        message.success('Category updated successfully');
      } else {
        // Create category
        await axios.post('/api/courses/categories/', values);
        message.success('Category created successfully');
      }
      
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            title="Are you sure you want to delete this category?"
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
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Course Category Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search categories..."
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
          Add Category
        </Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      {/* Category form modal */}
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
          name="category_form"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter category name' }
            ]}
          >
            <Input className="text-gray-900" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Category Description"
          >
            <Input.TextArea rows={4} className="text-gray-900" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagementPage; 