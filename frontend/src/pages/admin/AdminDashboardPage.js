import React from 'react';
import { Card, Row, Col, Typography, Divider, Space } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, CalendarOutlined, SettingOutlined, BarChartOutlined, ShopOutlined, FileProtectOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AdminDashboardPage = () => {
  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]} className="mb-6">
        <Col span={24}>
          <Card>
            <Title level={2}>Welcome to Gym Management System</Title>
            <Paragraph>
              A comprehensive solution designed to streamline operations for fitness facilities.
              This system provides both customer-facing and administrative interfaces to manage all aspects of gym operations.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Key Features" className="h-full">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong><UserOutlined /> User Management</Text>
                <Paragraph>
                  Comprehensive user management with role-based access control. 
                  Separate interfaces for managing staff, members, and instructors.
                </Paragraph>
              </div>
              
              <div>
                <Text strong><TeamOutlined /> Membership Management</Text>
                <Paragraph>
                  Create and manage membership plans, track member status, and handle renewals.
                  Support for various membership types and pricing tiers.
                </Paragraph>
              </div>
              
              <div>
                <Text strong><CalendarOutlined /> Course Management</Text>
                <Paragraph>
                  Organize fitness classes, manage schedules, and track attendance.
                  Support for course categories, instructor assignments, and capacity management.
                </Paragraph>
              </div>
              
              <div>
                <Text strong><DollarOutlined /> Payment Processing</Text>
                <Paragraph>
                  Handle payments for memberships and courses. Generate invoices and track revenue.
                  Support for multiple payment methods and transaction history.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Administrative Tools" className="h-full">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong><BarChartOutlined /> Reports & Analytics</Text>
                <Paragraph>
                  Generate detailed reports on membership growth, revenue, course attendance, and more.
                  Visualize key metrics through interactive charts and dashboards.
                </Paragraph>
              </div>
              
              <div>
                <Text strong><SettingOutlined /> System Settings</Text>
                <Paragraph>
                  Configure system behavior, notification preferences, and user permissions.
                  Customize the application to meet your business needs.
                </Paragraph>
              </div>
              
              <div>
                <Text strong><ShopOutlined /> Facility Management</Text>
                <Paragraph>
                  Track equipment, manage maintenance schedules, and optimize facility usage.
                  Monitor room occupancy and equipment availability.
                </Paragraph>
              </div>
              
              <div>
                <Text strong><FileProtectOutlined /> Data Security</Text>
                <Paragraph>
                  Secure user data with role-based access control and encryption.
                  Regular backup and restore functionality to prevent data loss.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-6">
        <Col span={24}>
          <Card title="Technology Stack">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="Frontend">
                  <ul className="pl-5">
                    <li>React.js</li>
                    <li>Ant Design</li>
                    <li>Tailwind CSS</li>
                    <li>Redux</li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="Backend">
                  <ul className="pl-5">
                    <li>Django</li>
                    <li>Django REST Framework</li>
                    <li>Celery</li>
                    <li>WebSockets</li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="Database">
                  <ul className="pl-5">
                    <li>PostgreSQL</li>
                    <li>Redis</li>
                    <li>Database Migrations</li>
                    <li>Data Backup</li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card type="inner" title="Deployment">
                  <ul className="pl-5">
                    <li>Docker</li>
                    <li>Nginx</li>
                    <li>CI/CD Pipeline</li>
                    <li>Cloud Hosting</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage; 