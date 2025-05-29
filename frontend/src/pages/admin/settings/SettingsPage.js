import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Switch, Select, Divider, Card, Row, Col, Upload, message, Popconfirm, Table, Badge, InputNumber, TimePicker, Space } from 'antd';
import { UploadOutlined, SaveOutlined, ReloadOutlined, ExportOutlined, ImportOutlined, CloudUploadOutlined, CloudDownloadOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [generalForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  
  const [activeTab, setActiveTab] = useState('1');

  // Load settings data
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Here we would call the real API
        // Example: const res = await axios.get('/api/settings');
        
        // For demo purposes
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set form initial values
        generalForm.setFieldsValue({
          siteName: 'Gym Management System',
          siteDescription: 'Professional gym management solution',
          contactEmail: 'admin@gym-system.com',
          contactPhone: '123-456-7890',
          address: '88 Fitness Street, Beijing',
          businessHours: 'Monday-Sunday 06:00-22:00'
        });
        
        systemForm.setFieldsValue({
          allowRegistration: true,
          defaultRole: 'user',
          sessionTimeout: 30,
          maintenance: false,
          backupFrequency: 'weekly',
          logLevel: 'info',
          enableCache: true,
          pageSize: 10
        });
        
        backupForm.setFieldsValue({
          autoBackup: true,
          backupTime: moment('09:00:00', 'HH:mm:ss'),
          keepBackups: 10,
          includeMedia: true,
          backupLocation: 'local'
        });
        
        notificationForm.setFieldsValue({
          emailNotifications: true,
          smsNotifications: false,
          reminderTime: 24,
          newMemberNotification: true,
          courseBookingNotification: true,
          paymentNotification: true,
          expirationReminder: true,
          marketingEmails: false
        });
      } catch (error) {
        message.error('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [generalForm, systemForm, backupForm, notificationForm]);

  // Submit general settings form
  const handleGeneralSubmit = async (values) => {
    setLoading(true);
    try {
      // In a real project, we would call the real API
      // Example: await axios.post('/api/settings/general', values);
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('General settings saved');
    } catch (error) {
      message.error('Failed to save general settings');
    } finally {
      setLoading(false);
    }
  };

  // Submit system settings form
  const handleSystemSubmit = async (values) => {
    setLoading(true);
    try {
      // In a real project, we would call the real API
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('System settings saved');
    } catch (error) {
      message.error('Failed to save system settings');
    } finally {
      setLoading(false);
    }
  };

  // Submit backup settings form
  const handleBackupSubmit = async (values) => {
    const formData = { ...values };
    if (formData.backupTime) {
      formData.backupTime = formData.backupTime.format('HH:mm:ss');
    }
    
    setLoading(true);
    try {
      // In a real project, we would call the real API
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('Backup settings saved');
    } catch (error) {
      message.error('Failed to save backup settings');
    } finally {
      setLoading(false);
    }
  };

  // Submit notification settings form
  const handleNotificationSubmit = async (values) => {
    setLoading(true);
    try {
      // In a real project, we would call the real API
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('Notification settings saved');
    } catch (error) {
      message.error('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  // Execute system backup
  const handleBackup = async () => {
    setLoading(true);
    try {
      // In a real project, we would call the real API
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('System backup completed');
    } catch (error) {
      message.error('System backup failed');
    } finally {
      setLoading(false);
    }
  };

  // Restore system data
  const handleRestore = async () => {
    // Simulate restore operation
    message.info('Please select a backup file to restore');
  };

  // Mock backup records
  const backupRecords = [
    { id: 1, name: 'auto_backup_20230601_090000', size: '45.8 MB', type: 'Auto', status: 'success', createdAt: '2023-06-01 09:00:00' },
    { id: 2, name: 'manual_backup_20230528_153012', size: '46.2 MB', type: 'Manual', status: 'success', createdAt: '2023-05-28 15:30:12' },
    { id: 3, name: 'auto_backup_20230525_090000', size: '44.9 MB', type: 'Auto', status: 'success', createdAt: '2023-05-25 09:00:00' },
    { id: 4, name: 'manual_backup_20230520_102545', size: '44.7 MB', type: 'Manual', status: 'success', createdAt: '2023-05-20 10:25:45' },
    { id: 5, name: 'auto_backup_20230518_090000', size: '44.5 MB', type: 'Auto', status: 'success', createdAt: '2023-05-18 09:00:00' },
  ];

  // Backup records table columns
  const backupColumns = [
    {
      title: 'Backup Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Badge 
          status={text === 'Auto' ? 'processing' : 'warning'} 
          text={text} 
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'success' ? 'success' : 'error'} 
          text={status === 'success' ? 'Success' : 'Failed'} 
        />
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<CloudDownloadOutlined />}>
            Download
          </Button>
          <Popconfirm
            title="Are you sure you want to restore this backup?"
            onConfirm={() => message.success(`Backup restored: ${record.name}`)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" size="small" icon={<ReloadOutlined />}>
              Restore
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>System Settings</h1>
      
      <Card>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
        >
          <TabPane tab="General Settings" key="1">
            <Form
              form={generalForm}
              layout="vertical"
              onFinish={handleGeneralSubmit}
              initialValues={{}}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="siteName"
                    label="System Name"
                    rules={[{ required: true, message: 'Please enter system name' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="contactEmail"
                    label="Contact Email"
                    rules={[{ required: true, message: 'Please enter contact email' }, { type: 'email', message: 'Please enter a valid email address' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="contactPhone"
                    label="Contact Phone"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="businessHours"
                    label="Business Hours"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="address"
                label="Address"
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="siteDescription"
                label="System Description"
              >
                <TextArea rows={4} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="System Settings" key="2">
            <Form
              form={systemForm}
              layout="vertical"
              onFinish={handleSystemSubmit}
              initialValues={{}}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="allowRegistration"
                    label="Allow User Registration"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="defaultRole"
                    label="Default User Role"
                  >
                    <Select>
                      <Option value="user">Regular User</Option>
                      <Option value="member">Member</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="sessionTimeout"
                    label="Session Timeout (minutes)"
                  >
                    <InputNumber min={5} max={120} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="maintenance"
                    label="Maintenance Mode"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="pageSize"
                    label="Default Page Size"
                  >
                    <Select>
                      <Option value={10}>10</Option>
                      <Option value={20}>20</Option>
                      <Option value={50}>50</Option>
                      <Option value={100}>100</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="logLevel"
                    label="Log Level"
                  >
                    <Select>
                      <Option value="error">Error</Option>
                      <Option value="warn">Warning</Option>
                      <Option value="info">Info</Option>
                      <Option value="debug">Debug</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="enableCache"
                    label="Enable Cache"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="backupFrequency"
                    label="Backup Frequency"
                  >
                    <Select>
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Notification Settings" key="3">
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSubmit}
              initialValues={{}}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="emailNotifications"
                    label="Enable Email Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="smsNotifications"
                    label="Enable SMS Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="reminderTime"
                    label="Reminder Time (hours)"
                  >
                    <InputNumber min={1} max={72} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider orientation="left">Notification Types</Divider>
              
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="newMemberNotification"
                    label="New Member Registration"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="courseBookingNotification"
                    label="Course Booking"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="paymentNotification"
                    label="Payment"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="expirationReminder"
                    label="Membership Expiration"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="marketingEmails"
                    label="Marketing Emails"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Backup & Restore" key="4">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="Backup Records" bordered={false}>
                  <Table
                    columns={backupColumns}
                    dataSource={backupRecords}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
              
              <Col span={8}>
                <Card title="Backup Operations" bordered={false}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      type="primary" 
                      icon={<CloudUploadOutlined />} 
                      block
                      onClick={handleBackup}
                      loading={loading}
                    >
                      Backup Now
                    </Button>
                    
                    <Upload>
                      <Button 
                        icon={<ImportOutlined />} 
                        block
                        onClick={handleRestore}
                      >
                        Upload Backup File
                      </Button>
                    </Upload>
                    
                    <Divider />
                    
                    <Form
                      form={backupForm}
                      layout="vertical"
                      onFinish={handleBackupSubmit}
                    >
                      <Form.Item
                        name="autoBackup"
                        label="Auto Backup"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        name="backupTime"
                        label="Backup Time"
                      >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                      </Form.Item>
                      
                      <Form.Item
                        name="keepBackups"
                        label="Retain Backup Count"
                      >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                      
                      <Form.Item
                        name="includeMedia"
                        label="Include Media Files"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        name="backupLocation"
                        label="Backup Location"
                      >
                        <Select>
                          <Option value="local">Local</Option>
                          <Option value="cloud">Cloud</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} block loading={loading}>
                          Save Backup Settings
                        </Button>
                      </Form.Item>
                    </Form>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage; 