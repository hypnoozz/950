import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, message, Modal, Form, Select, Descriptions, Badge, InputNumber } from 'antd';
import { SearchOutlined, EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  
  // 模态框状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 获取会员列表
  const fetchMembers = async () => {
    try {
      const res = await axios.get('/api/users/', { 
        params: { 
          role: 'member'  // 添加角色过滤，只获取会员用户
        } 
      });
      const membersData = Array.isArray(res.data) ? res.data : 
                         (res.data.results ? res.data.results : []);
      setMembers(membersData);
    } catch (e) {
      console.error('Failed to get member list:', e);
      message.error('Failed to get member list');
    }
  };

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders/', { params: { search } });
      const ordersData = Array.isArray(res.data) ? res.data : 
                        (res.data.results ? res.data.results : []);
      setOrders(ordersData);
    } catch (e) {
      console.error('Failed to get order list:', e);
      message.error('Failed to get order list');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchMembers();
    // eslint-disable-next-line
  }, [search]);

  // 取消订单
  const handleCancelOrder = async (id) => {
    try {
      await axios.put(`/api/orders/${id}/cancel/`);
      message.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('取消订单失败:', error);
      message.error('取消订单失败');
    }
  };
  
  // 查看订单详情
  const showDetailModal = (order) => {
    setCurrentOrder(order);
    setDetailModalVisible(true);
  };
  
  // 打开更新状态模态框
  const showStatusModal = (order) => {
    setCurrentOrder(order);
    form.setFieldsValue({
      status: order.status
    });
    setStatusModalVisible(true);
  };
  
  // 处理模态框取消
  const handleModalCancel = () => {
    setDetailModalVisible(false);
    setStatusModalVisible(false);
  };
  
  // 处理更新状态
  const handleUpdateStatus = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      await axios.put(`/api/orders/${currentOrder.id}/`, {
        status: values.status
      });
      
      message.success('Order status updated successfully');
      setStatusModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error(error.response?.data?.error || '更新订单状态失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 订单状态标签
  const renderStatusTag = (status) => {
    const statusMap = {
      'pending': { color: 'gold', text: 'Pending' },
      'paid': { color: 'green', text: 'Paid' },
      'cancelled': { color: 'red', text: 'Cancelled' },
      'refunded': { color: 'gray', text: 'Refunded' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  // 订单类型
  const renderOrderType = (type) => {
    const typeMap = {
      'membership': 'Membership',
      'course': 'Course',
      'product': 'Product'
    };
    return typeMap[type] || type;
  };

  // 支付方式
  const renderPaymentMethod = (method) => {
    if (!method) return '-';
    const methodMap = {
      'wechat': 'Wechat',
      'alipay': 'Alipay',
      'cash': 'Cash',
      'card': 'Card'
    };
    return methodMap[method] || method;
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_id',
      key: 'order_id',
      ellipsis: true,
    },
    {
      title: 'Member',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (_, record) => record.user?.username || '-'
    },
    {
      title: 'Type',
      dataIndex: 'order_type',
      key: 'order_type',
      render: (type) => renderOrderType(type)
    },
    {
      title: 'Amount',
      dataIndex: 'actual_amount',
      key: 'actual_amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status)
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            type="primary" 
            ghost
            onClick={() => showDetailModal(record)}
          >
            Details
          </Button>
          {record.status === 'pending' && (
            <Button 
              icon={<CloseCircleOutlined />} 
              size="small" 
              type="danger" 
              ghost
              onClick={() => handleCancelOrder(record.id)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Order Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search orders..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />
        <Select 
          placeholder="Order Status"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => setSearch(value || '')}
        >
          <Option value="pending">Pending</Option>
          <Option value="paid">Paid</Option>
          <Option value="cancelled">Cancelled</Option>
          <Option value="refunded">Refunded</Option>
        </Select>
        <Select 
          placeholder="Order Type"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => setSearch(value || '')}
        >
          <Option value="membership">Membership</Option>
          <Option value="course">Course</Option>
          <Option value="product">Product</Option>
        </Select>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      {/* 订单详情模态框 */}
      {currentOrder && (
        <Modal
          title="Order Details"
          open={detailModalVisible}
          onCancel={handleModalCancel}
          footer={[
            <Button key="back" onClick={handleModalCancel}>
              Close
            </Button>,
            currentOrder.status === 'pending' ? (
              <Button 
                key="cancel" 
                danger 
                onClick={() => handleCancelOrder(currentOrder.id)}
              >
                Cancel Order
              </Button>
            ) : null,
            <Button 
              key="update" 
              type="primary" 
              onClick={() => {
                handleModalCancel();
                showStatusModal(currentOrder);
              }}
            >
              Update Status
            </Button>,
          ]}
          width={700}
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Order Number" span={2}>{currentOrder.order_id}</Descriptions.Item>
            <Descriptions.Item label="Member">{currentOrder.user?.username || '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge 
                status={
                  currentOrder.status === 'paid' ? 'success' : 
                  currentOrder.status === 'pending' ? 'processing' : 
                  currentOrder.status === 'cancelled' ? 'error' : 'default'
                } 
                text={renderStatusTag(currentOrder.status)} 
              />
            </Descriptions.Item>
            <Descriptions.Item label="Order Type">{renderOrderType(currentOrder.order_type)}</Descriptions.Item>
            <Descriptions.Item label="Payment Method">{renderPaymentMethod(currentOrder.payment_method)}</Descriptions.Item>
            <Descriptions.Item label="Original Amount">¥{currentOrder.total_amount}</Descriptions.Item>
            <Descriptions.Item label="Discount Amount">¥{currentOrder.discount_amount}</Descriptions.Item>
            <Descriptions.Item label="Actual Amount">¥{currentOrder.actual_amount}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {currentOrder.created_at ? moment(currentOrder.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Paid At">
              {currentOrder.paid_at ? moment(currentOrder.paid_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Remark" span={2}>{currentOrder.remark || '-'}</Descriptions.Item>
          </Descriptions>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Order Items</h3>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={currentOrder.items || []}
              columns={[
                {
                  title: 'Item Name',
                  dataIndex: 'item_name',
                  key: 'item_name',
                },
                {
                  title: 'Price',
                  dataIndex: 'item_price',
                  key: 'item_price',
                  render: (price) => `¥${price}`
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Subtotal',
                  dataIndex: 'item_total',
                  key: 'item_total',
                  render: (total) => `¥${total}`
                },
              ]}
            />
          </div>
        </Modal>
      )}
      
      {/* 更新订单状态模态框 */}
      <Modal
        title="Update Order Status"
        open={statusModalVisible}
        onOk={handleUpdateStatus}
        confirmLoading={confirmLoading}
        onCancel={handleModalCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="update_status_form"
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[
              { required: true, message: 'Please select order status' }
            ]}
          >
            <Select className="text-gray-900">
              <Option value="pending">Pending</Option>
              <Option value="paid">Paid</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', min: 0, message: 'Amount must be greater than 0' }
            ]}
          >
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select order type' }]}
          >
            <Select className="text-gray-900">
              <Option value="course">Course</Option>
              <Option value="membership">Membership</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="member"
            label="Member"
            rules={[{ required: true, message: 'Please select member' }]}
          >
            <Select className="text-gray-900">
              {members.map(member => (
                <Option key={member.id} value={member.id}>
                  {member.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea className="text-gray-900" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagementPage; 