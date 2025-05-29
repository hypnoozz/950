import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Star, Users, Clock, ChevronDown, Filter, X, Sliders,
  ArrowUpDown, Dumbbell, Activity, BookOpen
} from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';

// 定义分类和难度选项
const categories = [
  { id: 'cardio', name: 'Aerobic', icon: Activity },
  { id: 'strength', name: 'Strength', icon: Dumbbell },
  { id: 'flexibility', name: 'Flexibility', icon: BookOpen },
  { id: 'combat', name: 'Combat', icon: Activity },
];

const difficulties = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
  { id: 'all-levels', name: 'All Levels' },
];

// Course Card Component
const CourseCard = ({ course }) => (
  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 group h-full flex flex-col transform hover:-translate-y-1">
    <div className="h-48 w-full overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent opacity-60 z-10"></div>
      <img 
        src={course.image || 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'} 
        alt={course.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full z-20 border border-gray-700">
        {course.category?.name || course.category}
      </div>
      
      {/* Availability Badge */}
      <div className="absolute bottom-3 left-3 z-20">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.current_capacity < course.capacity * 0.7 
            ? 'bg-green-900/70 text-green-300 border border-green-700/50' 
            : course.current_capacity < course.capacity 
              ? 'bg-yellow-900/70 text-yellow-300 border border-yellow-700/50'
              : 'bg-red-900/70 text-red-300 border border-red-700/50'
        }`}>
          {course.current_capacity < course.capacity ? `${course.capacity - course.current_capacity} spots left` : 'Full'}
        </div>
      </div>
    </div>
    
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-white leading-tight">{course.name}</h3>
        <div className="flex items-center text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="ml-1 text-sm">{course.rating || 4.5}</span>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-4 flex-grow">{course.description}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          <span>{course.instructor?.username || 'Instructor'}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{course.duration} minutes</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.difficulty === 'beginner' 
            ? 'bg-green-900/50 text-green-300' 
            : course.difficulty === 'intermediate' 
              ? 'bg-blue-900/50 text-blue-300'
              : course.difficulty === 'advanced'
                ? 'bg-purple-900/50 text-purple-300'
                : 'bg-gray-700/50 text-gray-300'
        }`}>
          {course.difficulty === 'beginner' ? 'Beginner' : 
           course.difficulty === 'intermediate' ? 'Intermediate' : 
           course.difficulty === 'advanced' ? 'Advanced' : 'All Levels'}
        </span>
        
        <Link 
          to={`/courses/${course.id}`}
          className="flex items-center justify-center py-2 px-4 bg-primary hover:bg-primary-dark rounded-lg text-white text-sm font-medium transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
);

// Filter Badge Component
const FilterBadge = ({ label, onRemove }) => (
  <div className="inline-flex items-center bg-primary/20 text-primary rounded-full px-3 py-1 text-sm mr-2 mb-2">
    <span>{label}</span>
    <button onClick={onRemove} className="ml-2 text-primary hover:text-white">
      <X className="w-3 h-3" />
    </button>
  </div>
);

// Main Courses Page Component
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  
  // Fetch category data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/courses/categories/');
        const categoriesData = Array.isArray(res.data) ? res.data : 
                             (res.data.results ? res.data.results : []);
        
        // Map backend categories to frontend display format
        const mappedCategories = categoriesData.map(category => ({
          id: category.id.toString(),
          name: category.name,
          icon: getCategoryIcon(category.name)
        }));
        
        setCategoryData(mappedCategories);
      } catch (error) {
        console.error('Failed to get course categories:', error);
        message.error('Failed to get course categories');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Get icon based on category name
  const getCategoryIcon = (name) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('cardio')) {
      return Activity;
    } else if (lowercaseName.includes('strength')) {
      return Dumbbell;
    } else if (lowercaseName.includes('flex')) {
      return BookOpen;
    } else {
      return Activity;
    }
  };
  
  // Fetch course data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/courses/');
        const coursesData = Array.isArray(res.data) ? res.data : 
                           (res.data.results ? res.data.results : []);
        
        // Process course data
        const processedCourses = coursesData.map(course => {
          // Set current enrollment, default to 0
          const current_capacity = course.current_capacity || 0;
          
          return {
            ...course,
            current_capacity,
            // Set default rating if none exists
            rating: course.rating || 4.5
          };
        });
        
        setCourses(processedCourses);
        setFilteredCourses(processedCourses);
      } catch (error) {
        console.error('Failed to get course list:', error);
        message.error('Failed to get course list');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        course => 
          course.name.toLowerCase().includes(term) || 
          course.description.toLowerCase().includes(term)
      );
    }
    
    // Apply category filters
    if (selectedCategories.length > 0) {
      result = result.filter(course => {
        // 检查课程分类是否在选定的分类中
        if (typeof course.category === 'object' && course.category) {
          return selectedCategories.includes(course.category.id.toString());
        } else if (typeof course.category === 'number') {
          return selectedCategories.includes(course.category.toString());
        }
        return false;
      });
    }
    
    // Apply difficulty filters
    if (selectedDifficulties.length > 0) {
      result = result.filter(course => 
        selectedDifficulties.includes(course.difficulty)
      );
    }
    
    // Apply sorting
    switch(sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default sort by relevance (keep original order)
        break;
    }
    
    setFilteredCourses(result);
  }, [courses, searchTerm, selectedCategories, selectedDifficulties, sortBy]);
  
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const toggleDifficulty = (difficultyId) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficultyId)
        ? prev.filter(id => id !== difficultyId)
        : [...prev, difficultyId]
    );
  };
  
  const removeCategoryFilter = (categoryId) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
  };
  
  const removeDifficultyFilter = (difficultyId) => {
    setSelectedDifficulties(prev => prev.filter(id => id !== difficultyId));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setSortBy('relevance');
  };
  
  // 用于展示的分类列表，优先使用从后端获取的分类
  const displayCategories = categoryData.length > 0 ? categoryData : categories;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-semibold text-white">Loading courses...</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Our Courses</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Discover courses that suit you, whether you're a beginner or an experienced fitness enthusiast. Our professional instructors will provide you with an excellent experience.
        </p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-4 top-3.5 text-gray-500" />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 py-3 px-4 bg-gray-800/60 border border-gray-700 rounded-xl text-white hover:bg-gray-700/60 transition-colors duration-200"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="relative group">
              <button 
                className="flex items-center gap-2 py-3 px-4 bg-gray-800/60 border border-gray-700 rounded-xl text-white hover:bg-gray-700/60 transition-colors duration-200"
              >
                <ArrowUpDown className="w-5 h-5" />
                <span>Sort</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-10 hidden group-hover:block">
                <div className="p-2">
                  <button 
                    onClick={() => setSortBy('relevance')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'relevance' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    Related
                  </button>
                  <button 
                    onClick={() => setSortBy('price-asc')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'price-asc' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    Price: Low to High
                  </button>
                  <button 
                    onClick={() => setSortBy('price-desc')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'price-desc' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    Price: High to Low
                  </button>
                  <button 
                    onClick={() => setSortBy('rating-desc')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${sortBy === 'rating-desc' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    Rating: High to Low
                  </button>
                </div>
              </div>
            </div>
            
            {(selectedCategories.length > 0 || selectedDifficulties.length > 0 || searchTerm) && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 py-3 px-4 bg-gray-800/60 border border-gray-700 rounded-xl text-white hover:bg-gray-700/60 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedDifficulties.length > 0) && (
          <div className="mb-4 flex flex-wrap">
            {selectedCategories.map(categoryId => {
              const category = displayCategories.find(c => c.id.toString() === categoryId.toString());
              return category ? (
                <FilterBadge 
                  key={`cat-${categoryId}`} 
                  label={`Category: ${category.name}`} 
                  onRemove={() => removeCategoryFilter(categoryId)} 
                />
              ) : null;
            })}
            
            {selectedDifficulties.map(difficultyId => {
              const difficulty = difficulties.find(d => d.id === difficultyId);
              return (
                <FilterBadge 
                  key={`diff-${difficultyId}`} 
                  label={`Difficulty: ${difficulty.name}`} 
                  onRemove={() => removeDifficultyFilter(difficultyId)} 
                />
              );
            })}
          </div>
        )}
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Sliders className="w-4 h-4 mr-2" />
                  Course Categories
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {displayCategories.map(category => {
                    const isSelected = selectedCategories.includes(category.id.toString());
                    const CategoryIcon = category.icon;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id.toString())}
                        className={`flex items-center p-2 rounded-lg text-sm ${
                          isSelected 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'text-gray-300 border border-gray-700 hover:bg-gray-700/50'
                        }`}
                      >
                        <CategoryIcon className="w-4 h-4 mr-2" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Difficulty */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Sliders className="w-4 h-4 mr-2" />
                  Difficulty Level
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {difficulties.map(difficulty => {
                    const isSelected = selectedDifficulties.includes(difficulty.id);
                    
                    return (
                      <button
                        key={difficulty.id}
                        onClick={() => toggleDifficulty(difficulty.id)}
                        className={`flex items-center p-2 rounded-lg text-sm ${
                          isSelected 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'text-gray-300 border border-gray-700 hover:bg-gray-700/50'
                        }`}
                      >
                        <span>{difficulty.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <h3 className="text-xl text-white font-semibold mb-2">No courses found matching your criteria</h3>
            <p className="text-gray-400">Try adjusting your filters or clear all filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage; 