import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { 
  User, Camera, Upload, Save, CheckCircle, Edit2, X, Calendar, CreditCard, Book, 
  Clock, AlertCircle, ArrowRightCircle, Dumbbell 
} from 'lucide-react';
import axios from 'axios';

// Tabs data
const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'membership', label: 'Membership', icon: CreditCard },
  { id: 'enrollments', label: 'My Courses', icon: Book }
];

const ProfilePage = () => {
  const { currentUser, updateUserProfileContext, isLoading, showToast } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    address: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileData, setProfileData] = useState({
    height: '',
    weight: '',
    fitness_goal: '',
    fitness_level: '',
    health_condition: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Fetch user profile data
  useEffect(() => {
    if (currentUser) {
      // Set form data from current user
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        birth_date: currentUser.birth_date || '',
        gender: currentUser.gender || '',
        address: currentUser.address || '',
      });
      
      // Set avatar preview if available
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
      
      // Fetch profile data if not already included in currentUser
      if (currentUser.profile) {
        setProfileData({
          height: currentUser.profile.height || '',
          weight: currentUser.profile.weight || '',
          fitness_goal: currentUser.profile.fitness_goal || '',
          fitness_level: currentUser.profile.fitness_level || '',
          health_condition: currentUser.profile.health_condition || '',
        });
      } else {
        // If nested profile data isn't included in the user object, fetch it
        const fetchProfileData = async () => {
          try {
            const response = await axios.get(`/api/users/${currentUser.id}/profile/`);
            setProfileData({
              height: response.data.height || '',
              weight: response.data.weight || '',
              fitness_goal: response.data.fitness_goal || '',
              fitness_level: response.data.fitness_level || '',
              health_condition: response.data.health_condition || '',
            });
          } catch (error) {
            console.error('Failed to fetch profile data:', error);
          }
        };
        
        fetchProfileData();
      }
    }
  }, [currentUser]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear any previous error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  // Handle profile input changes
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
    
    // Clear any previous error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  // Handle image drop
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setAvatarFile(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });
  
  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setIsUploading(true);
    
    // Create a FormData object to send the image
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    try {
      const response = await axios.post(`/api/users/${currentUser.id}/avatar/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update avatar in local state
      setAvatarPreview(response.data.avatar);
      showToast('Avatar updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showToast('Failed to upload avatar. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setAvatarFile(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Combine user and profile data
      const userData = {
        ...formData,
        profile: profileData,
      };
      
      // Update user profile
      await updateUserProfileContext(userData);
      
      // Upload avatar if exists
      if (avatarFile) {
        await handleAvatarUpload();
      }
      
      setEditMode(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      // Handle API validation errors
      if (error.response?.data) {
        const apiErrors = {};
        
        // Extract field errors
        Object.entries(error.response.data).forEach(([key, value]) => {
          apiErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        
        // Handle nested profile errors
        if (error.response.data.profile) {
          Object.entries(error.response.data.profile).forEach(([key, value]) => {
            apiErrors[key] = Array.isArray(value) ? value[0] : value;
          });
        }
        
        setErrors(apiErrors);
      } else {
        showToast('Failed to update profile. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Loading state
  if (isLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-300">Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          <p className="text-gray-400 mt-2">Manage your account and personal information</p>
        </div>
        
        {/* Profile Card */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center border-b border-gray-700/50">
            {/* Avatar */}
            <div className="relative group">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 ${editMode ? 'border-primary' : 'border-gray-700'} shadow-lg`}>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
              
              {editMode && (
                <div {...getRootProps()} className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-xs text-white">
                      {isDragActive ? 'Drop image here' : 'Change avatar'}
                    </span>
                  </div>
                </div>
              )}
              
              {avatarFile && editMode && (
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={isUploading}
                    className="flex items-center text-xs bg-primary text-white px-3 py-1 rounded-full"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-3 h-3 border-t-2 border-white border-solid rounded-full animate-spin mr-1"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="text-center sm:text-left flex-grow">
              <h2 className="text-2xl font-bold text-white">
                {currentUser.username}
              </h2>
              <p className="text-gray-400 mt-1">{currentUser.email}</p>
              
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  {currentUser.role || 'Member'}
                </span>
                {currentUser.membership_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                    {currentUser.membership_type === 'monthly' ? 'Monthly' :
                     currentUser.membership_type === 'quarterly' ? 'Quarterly' :
                     currentUser.membership_type === 'yearly' ? 'Yearly' : 'Premium'} Membership
                  </span>
                )}
              </div>
            </div>
            
            {/* Edit Button */}
            <div>
              {editMode ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="p-2 text-white bg-primary hover:bg-primary-dark rounded-lg flex items-center"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="p-2 text-white bg-primary hover:bg-primary-dark rounded-lg"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="flex overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`px-4 py-3 font-medium flex items-center transition-colors duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {React.createElement(tab.icon, { className: 'w-4 h-4 mr-2' })}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Basic Information
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Username Field */}
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className={`w-full px-3 py-2 bg-gray-700/50 border ${
                            errors.username ? 'border-red-500' : 'border-gray-600'
                          } rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed`}
                        />
                        {errors.username && (
                          <p className="mt-1 text-sm text-red-400 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.username}
                          </p>
                        )}
                      </div>
                      
                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className={`w-full px-3 py-2 bg-gray-700/50 border ${
                            errors.email ? 'border-red-500' : 'border-gray-600'
                          } rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-400 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      
                      {/* Phone Field */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="Enter your phone number"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Gender Field */}
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fitness Profile */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Dumbbell className="w-5 h-5 mr-2 text-primary" />
                      Fitness Profile
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Height and Weight Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            id="height"
                            name="height"
                            value={profileData.height || ''}
                            onChange={handleProfileInputChange}
                            disabled={!editMode}
                            placeholder="Height in cm"
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={profileData.weight || ''}
                            onChange={handleProfileInputChange}
                            disabled={!editMode}
                            placeholder="Weight in kg"
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      
                      {/* Fitness Goal */}
                      <div>
                        <label htmlFor="fitness_goal" className="block text-sm font-medium text-gray-300 mb-1">
                          Fitness Goal
                        </label>
                        <select
                          id="fitness_goal"
                          name="fitness_goal"
                          value={profileData.fitness_goal || ''}
                          onChange={handleProfileInputChange}
                          disabled={!editMode}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="">Select fitness goal</option>
                          <option value="weight_loss">Weight Loss</option>
                          <option value="muscle_gain">Muscle Gain</option>
                          <option value="fitness">General Fitness</option>
                          <option value="wellness">Wellness</option>
                          <option value="rehabilitation">Rehabilitation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      {/* Fitness Level */}
                      <div>
                        <label htmlFor="fitness_level" className="block text-sm font-medium text-gray-300 mb-1">
                          Fitness Level
                        </label>
                        <select
                          id="fitness_level"
                          name="fitness_level"
                          value={profileData.fitness_level || ''}
                          onChange={handleProfileInputChange}
                          disabled={!editMode}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="">Select fitness level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      
                      {/* Health Condition */}
                      <div>
                        <label htmlFor="health_condition" className="block text-sm font-medium text-gray-300 mb-1">
                          Health Condition / Notes
                        </label>
                        <textarea
                          id="health_condition"
                          name="health_condition"
                          value={profileData.health_condition || ''}
                          onChange={handleProfileInputChange}
                          disabled={!editMode}
                          rows={3}
                          placeholder="Any health conditions, injuries or notes for trainers"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {editMode && (
                  <div className="flex justify-end pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}
            
            {activeTab === 'membership' && (
              <div>
                {currentUser.membership_type ? (
                  <div>
                    <div className="bg-gray-700/50 rounded-xl p-6 mb-6 border border-gray-600">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-primary" />
                        Active Membership
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center">
                          <div className="mr-6 mb-2">
                            <span className="block text-sm text-gray-400">Membership Type</span>
                            <span className="text-lg font-medium text-white">
                              {currentUser.membership_type === 'monthly' ? 'Monthly Plan' :
                               currentUser.membership_type === 'quarterly' ? 'Quarterly Plan' :
                               currentUser.membership_type === 'yearly' ? 'Yearly Plan' : 'Premium'}
                            </span>
                          </div>
                          
                          <div className="mr-6 mb-2">
                            <span className="block text-sm text-gray-400">Start Date</span>
                            <span className="text-lg font-medium text-white">
                              {currentUser.membership_start ? 
                                new Date(currentUser.membership_start).toLocaleDateString() : 
                                'N/A'}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <span className="block text-sm text-gray-400">End Date</span>
                            <span className="text-lg font-medium text-white">
                              {currentUser.membership_end ? 
                                new Date(currentUser.membership_end).toLocaleDateString() : 
                                'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-600">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-secondary mr-2" />
                            <span className="text-gray-300">Your membership is active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <button 
                        onClick={() => navigate('/membership')}
                        className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200"
                      >
                        Upgrade Membership
                        <ArrowRightCircle className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4 text-gray-400">
                      <CreditCard className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-white mb-2">No Active Membership</h3>
                      <p className="max-w-md mx-auto mb-6">
                        You don't have an active membership plan. Purchase a membership to enjoy full access to our facilities and courses.
                      </p>
                      <button 
                        onClick={() => navigate('/membership')}
                        className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200"
                      >
                        View Membership Plans
                        <ArrowRightCircle className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'enrollments' && (
              <div>
                {/* Would typically fetch this data from an API */}
                <div className="text-center py-8">
                  <div className="mb-4 text-gray-400">
                    <Book className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium text-white mb-2">No Courses Enrolled</h3>
                    <p className="max-w-md mx-auto mb-6">
                      You haven't enrolled in any courses yet. Browse our course catalog to find something that matches your fitness goals.
                    </p>
                    <button 
                      onClick={() => navigate('/courses')}
                      className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-200"
                    >
                      Browse Courses
                      <ArrowRightCircle className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 