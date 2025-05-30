import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCourses, enrollInCourse } from '../services/courseService';
import { fetchSchedules } from '../services/scheduleService';
import { Card, Button, Modal, message, Select, Input } from 'antd';
import { CalendarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import '../styles/CoursesPage.css';

const { Option } = Select;

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
    loadSchedules();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (error) {
      message.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await fetchSchedules();
      setSchedules(data);
    } catch (error) {
      message.error('Failed to load schedules');
    }
  };

  const handleEnroll = async (course, schedule) => {
    if (!isAuthenticated) {
      message.warning('Please login to enroll in courses');
      navigate('/login');
      return;
    }

    try {
      await enrollInCourse(course.id, schedule.id);
      message.success('Successfully enrolled in course');
      setIsModalVisible(false);
      loadSchedules(); // Refresh schedules to update capacity
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const showEnrollModal = (course) => {
    setSelectedCourse(course);
    setSelectedSchedule(null);
    setIsModalVisible(true);
  };

  const getCourseSchedules = (courseId) => {
    return schedules.filter(schedule => schedule.course === courseId);
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = filterCategory === 'all' || course.category.name === filterCategory;
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [...new Set(courses.map(course => course.category.name))];

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Available Courses</h1>
        <div className="courses-filters">
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 200, marginRight: 16 }}
          />
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: 200 }}
          >
            <Option value="all">All Categories</Option>
            {categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <Card
            key={course.id}
            hoverable
            cover={<img alt={course.name} src={course.image} />}
            className="course-card"
          >
            <Card.Meta
              title={course.name}
              description={
                <div>
                  <p>{course.description}</p>
                  <div className="course-info">
                    <span><UserOutlined /> {course.instructor.username}</span>
                    <span><ClockCircleOutlined /> {course.duration} min</span>
                    <span>${course.price}</span>
                  </div>
                  <div className="course-difficulty">
                    Difficulty: {course.difficulty}
                  </div>
                </div>
              }
            />
            <Button
              type="primary"
              onClick={() => showEnrollModal(course)}
              className="enroll-button"
            >
              Enroll Now
            </Button>
          </Card>
        ))}
      </div>

      <Modal
        title={`Enroll in ${selectedCourse?.name}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedCourse && (
          <div className="enroll-modal-content">
            <p>{selectedCourse.description}</p>
            <div className="schedule-selection">
              <h3>Select a Schedule</h3>
              {getCourseSchedules(selectedCourse.id).map(schedule => (
                <div
                  key={schedule.id}
                  className={`schedule-option ${selectedSchedule?.id === schedule.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSchedule(schedule)}
                >
                  <CalendarOutlined /> {new Date(schedule.start_time).toLocaleString()}
                  <br />
                  <small>Location: {schedule.location}</small>
                  <br />
                  <small>Available: {schedule.capacity - schedule.current_capacity} spots</small>
                </div>
              ))}
            </div>
            <Button
              type="primary"
              onClick={() => handleEnroll(selectedCourse, selectedSchedule)}
              disabled={!selectedSchedule}
              className="confirm-enroll-button"
            >
              Confirm Enrollment
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoursesPage; 