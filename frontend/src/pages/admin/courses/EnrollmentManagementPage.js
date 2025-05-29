import React, { useState, useEffect } from 'react';
import { 
  Table, Button, message, Space, Modal, Form, Input, Select, 
  DatePicker, Card, Tooltip, Tabs, Tag, Popconfirm 
} from 'antd';
import axios from 'axios';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, 
  ExclamationCircleOutlined, SearchOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;

const EnrollmentManagementPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch enrollment records with pagination
  const fetchEnrollments = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/courses/enrollments/', {
        params: {
          page: page,
          page_size: pageSize
        }
      });
      
      // Handle paginated response
      if (res.data && res.data.results) {
        setEnrollments(res.data.results);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: res.data.count || 0
        });
      } else if (Array.isArray(res.data)) {
        // Fallback for non-paginated response
        setEnrollments(res.data);
        setPagination({
          ...pagination,
          total: res.data.length
        });
      }
    } catch (error) {
      console.error('Failed to get enrollment records:', error);
      message.error('Failed to get enrollment records');
    } finally {
      setLoading(false);
    }
  };

  // Fetch course list
  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses/');
      const coursesData = Array.isArray(res.data) ? res.data : 
                          (res.data.results ? res.data.results : []);
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to get course list:', error);
    }
  };

  // Fetch user list
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users/');
      const usersData = Array.isArray(res.data) ? res.data : 
                        (res.data.results ? res.data.results : []);
      
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to get user list:', error);
    }
  };

  // Fetch schedule list
  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/courses/schedules/');
      const schedulesData = Array.isArray(res.data) ? res.data : 
                           (res.data.results ? res.data.results : []);
      
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Failed to get schedule list:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchEnrollments(pagination.current, pagination.pageSize);
    fetchCourses();
    fetchUsers();
    fetchSchedules();
  }, []);

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchEnrollments(pagination.current, pagination.pageSize);
  };

  // Update enrollment status
  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/courses/enrollments/${id}/`, { status });
      message.success(`Status updated successfully`);
      fetchEnrollments(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to update status:', error);
      message.error('Failed to update status');
    }
  };

  // Delete enrollment record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/courses/enrollments/${id}/`);
      message.success('Enrollment record deleted successfully');
      fetchEnrollments(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete enrollment record:', error);
      message.error('Failed to delete enrollment record');
    }
  };

  // Submit form
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await axios.put(`/api/courses/enrollments/${editingId}/`, values);
        message.success('Enrollment record updated successfully');
      } else {
        await axios.post('/api/courses/enrollments/', values);
        message.success('Enrollment record created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchEnrollments(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to save enrollment record:', error);
      message.error('Failed to save enrollment record');
    }
  };

  // Table columns definition
  const columns = [
    {
      title: 'No.',
      key: 'index',
      width: 80,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user_id, record) => {
        // Use user_name from API response if available
        if (record.user_name) {
          return record.user_name;
        }
        const user = users.find(u => u.id === user_id);
        return user ? user.username : user_id;
      }
    },
    {
      title: 'Course',
      dataIndex: 'schedule',
      key: 'course',
      render: (schedule_id, record) => {
        // Use course_name from API response if available
        if (record.course_name) {
          return record.course_name;
        }
        const schedule = schedules.find(s => s.id === schedule_id);
        const course = schedule ? courses.find(c => c.id === schedule.course) : null;
        return course ? course.name : schedule_id;
      }
    },
    {
      title: 'Schedule Time',
      key: 'schedule_time',
      render: (_, record) => {
        // Use schedule_time from API response if available
        if (record.schedule_time && record.schedule_time.start) {
          return `${moment(record.schedule_time.start).format('YYYY-MM-DD HH:mm')} (${record.schedule_time.location || ''})`;
        }
        const schedule = schedules.find(s => s.id === record.schedule);
        return schedule ? moment(schedule.start_time).format('YYYY-MM-DD HH:mm') : '-';
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'enrolled') color = 'green';
        if (status === 'cancelled') color = 'red';
        if (status === 'pending') color = 'orange';
        
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Enrollment Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          
          <Popconfirm
            title="Are you sure you want to delete this enrollment record?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Edit enrollment record
  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      user: record.user,
      schedule: record.schedule,
      status: record.status,
    });
    setModalVisible(true);
  };

  // Create new enrollment record
  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  return (
    <div className="p-6">
      <Card 
        title="Course Enrollment Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            Add Enrollment
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={enrollments} 
          rowKey="id" 
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Enrollment Record' : 'Create Enrollment Record'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="user"
            label="User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select a user">
              {users.map(user => (
                <Option key={user.id} value={user.id}>{user.username}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="schedule"
            label="Course Schedule"
            rules={[{ required: true, message: 'Please select a course schedule' }]}
          >
            <Select placeholder="Select a course schedule">
              {schedules.map(schedule => {
                const course = courses.find(c => c.id === schedule.course);
                return (
                  <Option key={schedule.id} value={schedule.id}>
                    {course?.name} - {moment(schedule.start_time).format('YYYY-MM-DD HH:mm')}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select a status">
              <Option value="enrolled">Enrolled</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Button 
                style={{ marginRight: 8 }} 
                onClick={() => setModalVisible(false)}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnrollmentManagementPage; 