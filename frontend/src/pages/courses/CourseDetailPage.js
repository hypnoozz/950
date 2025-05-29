import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Users, ArrowLeft, Star, 
  User, BookOpen, BarChart2, ChevronRight, Dumbbell,
  AlertCircle, MapPin, Check
} from 'lucide-react';
import axios from 'axios';
import { message, Tabs, Tooltip } from 'antd';

const { TabPane } = Tabs;

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [error, setError] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRes = await axios.get('/api/auth/user/');
        if (userRes.data && userRes.data.id) {
          setIsAuthenticated(true);
          setUser(userRes.data);
        }
      } catch (error) {
        console.error("Failed to get user info:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    
    checkAuth();
  }, []);

  // Get course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/courses/${id}/`);
        setCourse(res.data);
        
        // Get course schedules
        if (res.data) {
          try {
            const schedulesRes = await axios.get('/api/courses/schedules/', {
              params: { course_id: id }
            });
            
            if (schedulesRes.data && Array.isArray(schedulesRes.data)) {
              setSchedules(schedulesRes.data);
            } else if (schedulesRes.data && schedulesRes.data.results) {
              setSchedules(schedulesRes.data.results);
            } else {
              setSchedules([]);
            }
          } catch (scheduleError) {
            console.error("Failed to get course schedules:", scheduleError);
            setSchedules([]);
          }
        }
        
        // Get user enrollment information
        if (isAuthenticated && user) {
          try {
            const enrollmentsRes = await axios.get('/api/courses/enrollments/', {
              params: { user: user.id }
            });
            
            if (enrollmentsRes.data && Array.isArray(enrollmentsRes.data)) {
              setUserEnrollments(enrollmentsRes.data);
            } else if (enrollmentsRes.data && enrollmentsRes.data.results) {
              setUserEnrollments(enrollmentsRes.data.results);
            } else {
              setUserEnrollments([]);
            }
          } catch (enrollmentError) {
            console.error("Failed to get user enrollment information:", enrollmentError);
            setUserEnrollments([]);
          }
        }
      } catch (error) {
        console.error("Failed to get course details:", error);
        setError("Failed to get course details. Please try again later.");
        message.error('Failed to get course details');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate, isAuthenticated, user]);

  const handleEnroll = async (scheduleId) => {
    if (!isAuthenticated) {
      message.warning('Please log in to enroll in this course');
      navigate('/login');
      return;
    }

    // 检查用户角色是否为member
    if (user.role !== 'member') {
      message.warning('Only members can enroll in courses. Please upgrade your account to a member status.');
      navigate('/membership');
      return;
    }

    // 检查用户是否是会员
    if (!user.membership_status || user.membership_status === 'none') {
      message.warning('You need to be a member to enroll in courses. Please purchase a membership first.');
      navigate('/membership');
      return;
    }

    // 检查会员是否过期
    if (user.membership_status === 'expired') {
      message.warning('Your membership has expired. Please renew your membership to enroll in courses.');
      navigate('/membership');
      return;
    }
    
    try {
      setEnrolling(true);
      
      // 使用正确的报名API端点，传递schedule和user参数
      await axios.post('/api/courses/enrollments/', {
        schedule: scheduleId,
        user: user.id  // 添加user ID参数
      });
      
      message.success('Successfully enrolled in the course');
      
      // Refresh course data
      const res = await axios.get(`/api/courses/${id}/`);
      setCourse(res.data);
      
      // Refresh schedule data
      const schedulesRes = await axios.get('/api/courses/schedules/', {
        params: { course_id: id }
      });
      
      if (schedulesRes.data && Array.isArray(schedulesRes.data)) {
        setSchedules(schedulesRes.data);
      } else if (schedulesRes.data && schedulesRes.data.results) {
        setSchedules(schedulesRes.data.results);
      }
      
      // Refresh user enrollment information
      if (user && user.id) {
        const enrollmentsRes = await axios.get('/api/courses/enrollments/', {
          params: { user: user.id }
        });
        
        if (enrollmentsRes.data && Array.isArray(enrollmentsRes.data)) {
          setUserEnrollments(enrollmentsRes.data);
        } else if (enrollmentsRes.data && enrollmentsRes.data.results) {
          setUserEnrollments(enrollmentsRes.data.results);
        } else {
          setUserEnrollments([]);
        }
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
      // 翻译错误消息
      let errorMsg = error.response?.data?.detail || "Enrollment failed. Please try again.";
      
      // 特定错误消息的翻译
      if (errorMsg === '您已经报名过该课程') {
        errorMsg = 'You have already enrolled in this course';
      } else if (errorMsg === '该课程已满，无法报名') {
        errorMsg = 'This course is full, cannot enroll';
      } else if (errorMsg === '该字段是必填项。') {
        errorMsg = 'This field is required.';
      } else if (errorMsg === '只有会员才能报名课程') {
        errorMsg = 'Only members can enroll in courses';
      } else if (errorMsg === '会员已过期，请续费') {
        errorMsg = 'Your membership has expired, please renew';
      } else if (errorMsg === '您的用户角色不允许报名课程') {
        errorMsg = 'Your user role does not allow course enrollment';
      }
      
      // 处理字段错误
      if (error.response?.data?.user) {
        errorMsg = `User: ${error.response.data.user[0]}`;
      }
      if (error.response?.data?.schedule) {
        errorMsg = `Schedule: ${error.response.data.schedule[0]}`;
      }
      
      message.error(errorMsg);
    } finally {
      setEnrolling(false);
    }
  };
  
  // Format date time
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check for schedule conflicts (simplified version)
  const isScheduleConflict = (schedule) => {
    // In a real application, you would check if the user has other courses at the same time
    // Return false for no conflict
    return false;
  };
  
  // Check if already enrolled for a specific schedule
  const isAlreadyEnrolled = (scheduleId) => {
    // 检查用户是否已报名此排期
    return userEnrollments.some(enrollment => 
      enrollment.schedule === scheduleId && 
      (enrollment.status === 'enrolled' || enrollment.status === 'attended')
    );
  };

  // Get weekday
  const getWeekday = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[date.getDay()];
  };

  // Format time range
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startStr = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endStr = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-semibold text-white">Loading course details...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-200">Course Not Found</h2>
          <p className="mt-4 text-gray-400">The course you are looking for may have been removed or does not exist.</p>
          <Link to="/courses" className="mt-6 inline-block px-6 py-2 bg-primary hover:bg-blue-600 rounded-lg transition-colors">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-gray-400 text-sm">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link to="/courses" className="hover:text-primary">Courses</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-300">{course.name}</span>
      </div>

      {/* Course header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.name}</h1>
          
          <div className="flex flex-wrap items-center text-gray-300 mb-6 gap-4">
            {course.instructor_name && (
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                <span>Instructor: <span className="text-white">{course.instructor_name}</span></span>
              </div>
            )}
            
            {course.difficulty && (
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                <span>Difficulty: <span className="text-white">{
                  course.difficulty === 'beginner' ? 'Beginner' :
                  course.difficulty === 'intermediate' ? 'Intermediate' :
                  course.difficulty === 'advanced' ? 'Advanced' : course.difficulty
                }</span></span>
              </div>
            )}
            
            {course.duration && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                <span>{course.duration} minutes</span>
              </div>
            )}
            
            {/* Rating indicator */}
            {course.avg_rating && (
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-400 fill-current" />
                <span>{course.avg_rating.toFixed(1)} ({course.rating_count || 0} ratings)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course image */}
          {course.image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img 
                src={course.image} 
                alt={course.name} 
                className="w-full h-auto object-cover" 
              />
            </div>
          )}
          
          {/* Course description */}
          <div className="mb-6 bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Course Description</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{course.description}</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 text-white">Course Schedule</h2>
            
            {schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((schedule) => {
                  const isAvailable = schedule.current_capacity < schedule.capacity;
                  const isEnrolled = isAlreadyEnrolled(schedule.id);
                  
                  return (
                    <div 
                      key={schedule.id} 
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg bg-gray-700/30 border border-gray-600/50"
                    >
                      <div className="mb-3 md:mb-0">
                        <div className="flex items-center text-white mb-1">
                          <Calendar className="w-4 h-4 mr-2 text-primary" />
                          <span>{formatDateTime(schedule.start_time)}</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {schedule.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          {schedule.current_capacity}/{schedule.capacity} Enrolled
                        </span>
                        
                        {isEnrolled ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-xs">
                            <Check className="h-3 w-3 mr-1" /> Enrolled
                          </span>
                        ) : isAvailable ? (
                          <button
                            onClick={() => handleEnroll(schedule.id)}
                            disabled={enrolling}
                            className="px-3 py-1 bg-primary hover:bg-blue-600 rounded-lg text-white text-sm transition-colors"
                          >
                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                          </button>
                        ) : (
                          <Tooltip title="This session is fully booked">
                            <span className="inline-flex items-center px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" /> Full
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No schedule information available</p>
              </div>
            )}
          </div>

          {/* Instructor */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 text-white">About the Instructor</h2>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                <img 
                  src={course.instructor?.avatar || '/images/default-avatar.jpg'} 
                  alt={course.instructor?.username || course.instructor_name || 'Instructor'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=Instructor';
                  }}
                />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {course.instructor?.username || course.instructor_name || 'Instructor'}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {course.instructor?.bio || course.instructor?.profile?.bio || `Professional ${course.category?.name || 'fitness'} instructor with years of teaching experience.`}
                </p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30">
                    Professional Certification
                  </span>
                  <span className="px-3 py-1 bg-gray-700/40 text-gray-300 text-xs rounded-full border border-gray-600/50">
                    {course.category?.name || 'Fitness'} Expert
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Course Info Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 sticky top-6">
            <div className="text-3xl font-bold text-white mb-6">${course.price}</div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Duration</div>
                <div className="text-white font-medium">{course.duration} minutes</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Capacity</div>
                <div className="text-white font-medium">{course.capacity} per class</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Difficulty</div>
                <div className="text-white font-medium">
                  {course.difficulty === 'beginner' ? 'Beginner' : 
                   course.difficulty === 'intermediate' ? 'Intermediate' : 
                   course.difficulty === 'advanced' ? 'Advanced' : 'All Levels'}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Category</div>
                <div className="text-white font-medium">{course.category?.name || 'Uncategorized'}</div>
              </div>
            </div>
            
            {schedules.length > 0 ? (
              <button
                onClick={() => {
                  // Scroll to the course schedule section
                  document.querySelector('h2').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                }}
                className="w-full py-3 bg-primary hover:bg-blue-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center"
              >
                View Available Times
              </button>
            ) : (
              <div className="text-center p-3 bg-yellow-900/30 rounded-lg border border-yellow-700/50 mb-4">
                <div className="flex items-center justify-center mb-2 text-yellow-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">No available times</span>
                </div>
                <p className="text-sm text-gray-400">Please check back later or contact staff for more information</p>
              </div>
            )}
            
            <div className="mt-4 text-center text-sm text-gray-500">
              By enrolling, you agree to our course terms and conditions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage; 