import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, ChevronDown, Search, 
  Filter, ChevronRight, Users, Dumbbell, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import { useAuth } from '../../context/AuthContext';

// Weekday mapping
const weekdayMap = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ScheduleCard = ({ schedule }) => {
  // Calculate available slots
  const availabilityPercentage = (schedule.current_capacity / schedule.capacity) * 100;
  
  // Determine status color based on availability
  const getStatusColor = () => {
    if (availabilityPercentage >= 100) return 'bg-red-900/70 text-red-300 border-red-700/50';
    if (availabilityPercentage >= 70) return 'bg-yellow-900/70 text-yellow-300 border-yellow-700/50';
    return 'bg-green-900/70 text-green-300 border-green-700/50';
  };
  
  // Format date
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
  
  // Get weekday
  const getWeekday = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return weekdayMap[date.getDay()];
  };
  
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 group flex flex-col h-full transform hover:-translate-y-1">
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center mb-3">
            <Calendar className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-white">
              {formatDate(schedule.start_time)} ({getWeekday(schedule.start_time)})
            </span>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {schedule.current_capacity >= schedule.capacity 
              ? 'Fully Booked' 
              : `${schedule.capacity - schedule.current_capacity} slots left`}
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-300">{formatTimeRange(schedule.start_time, schedule.end_time)}</span>
        </div>
        
        <div className="flex items-center mb-4">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-300">{schedule.location}</span>
        </div>
        
        <div className="border-t border-gray-700 my-4"></div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-white leading-tight mb-2">{schedule.course_name}</h3>
          
          <div className="flex items-center text-sm text-gray-400 mb-4">
            <Users className="w-4 h-4 mr-1" />
            <span>{schedule.course_instructor || 'Instructor'}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-gray-400">
            {schedule.current_capacity}/{schedule.capacity} Enrolled
          </div>
          
          <Link 
            to={`/courses/${schedule.course}`}
            className="flex items-center text-primary hover:text-blue-400 transition-colors text-sm font-medium"
          >
            View Course 
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [error, setError] = useState(null);
  const { getAuthHeader } = useAuth();
  
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/courses/schedules/', getAuthHeader());
        
        // Process response data
        const schedulesData = Array.isArray(response.data) ? response.data : 
                             (response.data.results ? response.data.results : []);
        
        setSchedules(schedulesData);
      } catch (err) {
        console.error("Failed to get course schedules:", err);
        setError("Failed to get course schedules. Please try again later.");
        message.error('Failed to get course schedules');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules();
  }, [getAuthHeader]);
  
  // Filter schedules based on selected day and search query
  useEffect(() => {
    let result = [...schedules];
    
    // Filter by weekday
    if (selectedDay !== 'All') {
      result = result.filter(schedule => {
        if (!schedule.start_time) return false;
        const date = new Date(schedule.start_time);
        const weekday = weekdayMap[date.getDay()];
        return weekday === selectedDay;
      });
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(schedule => 
        (schedule.course_name && schedule.course_name.toLowerCase().includes(query)) || 
        (schedule.course_instructor && schedule.course_instructor.toLowerCase().includes(query)) ||
        (schedule.location && schedule.location.toLowerCase().includes(query))
      );
    }
    
    // Sort by time
    result.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    
    setFilteredSchedules(result);
  }, [schedules, selectedDay, searchQuery]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-semibold text-white">Loading course schedules...</h3>
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Course Schedule</h1>
        <p className="text-gray-400">Browse and find course times that work for you</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search box */}
        <div className="relative flex-grow md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search courses or instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Date filter */}
        <div className="relative w-full md:w-48">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="block appearance-none w-full bg-gray-800/70 border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Days</option>
            {daysOfWeek.slice(1).map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
      
      {filteredSchedules.length === 0 ? (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-700/50 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Schedules Found</h3>
          <p className="text-gray-400 mb-4">
            {selectedDay !== 'All' 
              ? `No courses scheduled for ${selectedDay}.` 
              : 'No courses match your search criteria.'}
          </p>
          {selectedDay !== 'All' || searchQuery !== '' ? (
            <button 
              onClick={() => {
                setSelectedDay('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div>
          {selectedDay !== 'All' && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">
                Courses for {selectedDay}
              </h2>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map(schedule => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage; 