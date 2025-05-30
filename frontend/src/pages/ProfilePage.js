import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Tabs, List, Tag, Button, message } from 'antd';
import { CalendarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { fetchUserEnrollments } from '../services/courseService';
import '../styles/ProfilePage.css';

const { TabPane } = Tabs;

const ProfilePage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const data = await fetchUserEnrollments();
      setEnrollments(data);
    } catch (error) {
      message.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="Profile" />
        </div>
        <div className="profile-info">
          <h1>{user?.username}</h1>
          <p>{user?.email}</p>
          <Tag color={user?.role === 'member' ? 'blue' : 'green'}>
            {user?.role?.toUpperCase()}
          </Tag>
        </div>
      </div>

      <Tabs defaultActiveKey="1" className="profile-tabs">
        <TabPane tab="My Courses" key="1">
          <List
            loading={loading}
            dataSource={enrollments}
            renderItem={enrollment => (
              <List.Item>
                <Card className="enrollment-card">
                  <div className="course-info">
                    <h3>{enrollment.schedule.course.name}</h3>
                    <p>{enrollment.schedule.course.description}</p>
                    <div className="schedule-info">
                      <p>
                        <CalendarOutlined /> {formatDate(enrollment.schedule.start_time)}
                      </p>
                      <p>
                        <ClockCircleOutlined /> {enrollment.schedule.course.duration} minutes
                      </p>
                      <p>
                        <UserOutlined /> {enrollment.schedule.course.instructor.username}
                      </p>
                    </div>
                    <div className="location-info">
                      Location: {enrollment.schedule.location}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab="Membership" key="2">
          {user?.membership ? (
            <Card className="membership-card">
              <h3>Current Membership</h3>
              <div className="membership-info">
                <p>Plan: {user.membership.plan.name}</p>
                <p>Start Date: {formatDate(user.membership.start_date)}</p>
                <p>End Date: {formatDate(user.membership.end_date)}</p>
                <p>Status: <Tag color={user.membership.is_active ? 'green' : 'red'}>
                  {user.membership.is_active ? 'Active' : 'Expired'}
                </Tag></p>
              </div>
            </Card>
          ) : (
            <Card className="membership-card">
              <h3>No Active Membership</h3>
              <p>You don't have an active membership plan.</p>
              <Button type="primary" href="/membership">
                View Membership Plans
              </Button>
            </Card>
          )}
        </TabPane>

        <TabPane tab="Profile Settings" key="3">
          <Card className="settings-card">
            <h3>Personal Information</h3>
            <div className="settings-info">
              <p>Username: {user?.username}</p>
              <p>Email: {user?.email}</p>
              <p>Phone: {user?.phone || 'Not set'}</p>
              <p>Address: {user?.address || 'Not set'}</p>
            </div>
            <Button type="primary">
              Edit Profile
            </Button>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfilePage; 