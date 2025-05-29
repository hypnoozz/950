import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Spin, Table, Divider } from 'antd';
import { UserOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('month'); // 'today', 'week', 'month', 'quarter', 'year'
  const [customDateRange, setCustomDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [reportData, setReportData] = useState({
    members: {
      total: 0,
      new: 0,
      active: 0,
      expired: 0,
      growth: 0
    },
    courses: {
      total: 0,
      scheduled: 0,
      completed: 0,
      attendance: 0
    },
    revenue: {
      total: 0,
      membership: 0,
      courses: 0,
      other: 0,
      growth: 0
    },
    popular: {
      courses: [],
      memberships: []
    }
  });

  // Fetch report data from API
  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Here we would call the real API
      // Example: const res = await axios.get('/api/admin/reports', { params: { timeRange, startDate, endDate } });
      
      // For demo purposes we're setting a timeout and using placeholder data
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      // In a real application, this would be replaced with actual API data
      setReportData({
        members: {
          total: 0,
          new: 0, 
          active: 0,
          expired: 0,
          growth: 0
        },
        courses: {
          total: 0,
          scheduled: 0,
          completed: 0,
          attendance: 0
        },
        revenue: {
          total: 0,
          membership: 0,
          courses: 0,
          other: 0,
          growth: 0
        },
        popular: {
          courses: [],
          memberships: []
        }
      });
    } catch (error) {
      // Handle error silently in demo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line
  }, [timeRange, customDateRange]);

  // Handle time range change
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    
    // Set corresponding date range
    const now = moment();
    let start;
    
    switch (value) {
      case 'today':
        start = now.clone().startOf('day');
        break;
      case 'week':
        start = now.clone().subtract(7, 'days');
        break;
      case 'month':
        start = now.clone().subtract(30, 'days');
        break;
      case 'quarter':
        start = now.clone().subtract(90, 'days');
        break;
      case 'year':
        start = now.clone().subtract(365, 'days');
        break;
      default:
        start = now.clone().subtract(30, 'days');
    }
    
    setCustomDateRange([start, now]);
  };

  // Handle custom date range change
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setTimeRange('custom');
      setCustomDateRange(dates);
    }
  };

  // Course ranking table columns
  const courseColumns = [
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Enrollments',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (value) => `$${value}`
    }
  ];

  // Membership plans ranking table columns
  const membershipColumns = [
    {
      title: 'Plan Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sales Count',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (value) => `$${value}`
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: 28, marginBottom: 0 }}>Reports</h1>
        
        <div className="flex items-center space-x-4">
          <Select 
            value={timeRange} 
            onChange={handleTimeRangeChange}
            style={{ width: 120 }}
          >
            <Option value="today">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="quarter">This Quarter</Option>
            <Option value="year">This Year</Option>
          </Select>
          
          <RangePicker 
            value={customDateRange}
            onChange={handleDateRangeChange}
            allowClear={false}
          />
        </div>
      </div>
      
      <Spin spinning={loading}>
        {/* Top statistics cards */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Members"
                value={0}
                prefix={<UserOutlined />}
                suffix={
                  <span className="text-xs ml-2" style={{ color: '#3f8600' }}>
                    <RiseOutlined />
                    0%
                  </span>
                }
              />
              <div className="mt-2 text-gray-500 text-sm">
                New: 0 | Active: 0
              </div>
            </Card>
          </Col>
          
          <Col span={6}>
            <Card>
              <Statistic
                title="Courses"
                value={0}
                prefix={<CalendarOutlined />}
              />
              <div className="mt-2 text-gray-500 text-sm">
                Scheduled: 0 | Completed: 0
              </div>
            </Card>
          </Col>
          
          <Col span={6}>
            <Card>
              <Statistic
                title="Attendance Rate"
                value={0}
                suffix="%"
              />
              <div className="mt-2 text-gray-500 text-sm">
                Based on completed courses
              </div>
            </Card>
          </Col>
          
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={0}
                prefix={<DollarOutlined />}
                suffix={
                  <span className="text-xs ml-2" style={{ color: '#3f8600' }}>
                    <RiseOutlined />
                    0%
                  </span>
                }
              />
              <div className="mt-2 text-gray-500 text-sm">
                Membership: $0 | Courses: $0
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* Revenue distribution */}
        <Row gutter={16} className="mb-6">
          <Col span={24}>
            <Card title="Revenue Distribution">
              <div className="flex items-center justify-center" style={{ height: 240 }}>
                <div className="text-center text-gray-400">
                  Charts would be displayed here
                  <br />
                  (Integrate with ECharts or other chart libraries in production)
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* Popular courses and membership plans */}
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Popular Courses">
              <Table 
                dataSource={[]} 
                columns={courseColumns} 
                rowKey="name"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="Popular Membership Plans">
              <Table 
                dataSource={[]} 
                columns={membershipColumns}
                rowKey="name" 
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default ReportsPage; 