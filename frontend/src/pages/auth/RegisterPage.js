import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AtSign, Lock, User, Eye, EyeOff, Mail, Check, AlertCircle, ChevronLeft } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formStep, setFormStep] = useState(1); // 1: credentials, 2: personal info
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Validate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    // Length check
    if (formData.password.length >= 8) strength += 25;
    // Contains lowercase letters
    if (/[a-z]/.test(formData.password)) strength += 25;
    // Contains uppercase letters
    if (/[A-Z]/.test(formData.password)) strength += 25;
    // Contains numbers or special characters
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [formData.password]);
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (formStep === 1) {
      if (!formData.username) newErrors.username = 'Username is required';
      else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (passwordStrength < 75) newErrors.password = 'Password is not strong enough';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formStep === 2) {
      if (formData.phone && !/^\d{10,11}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number should be 10-11 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Next step handler
  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setFormStep(2);
    }
  };
  
  // Previous step handler
  const handlePrevStep = () => {
    setFormStep(1);
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Construct the registration data
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null
      };
      
      await register(registrationData);
      navigate('/profile');
    } catch (err) {
      // Handle API validation errors
      if (err.response?.data) {
        const apiErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          apiErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      {/* Background elements */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-25" 
        style={{ backgroundImage: `url('/images/gym-background.jpg')` }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-800 z-10"></div>
      
      {/* Content */}
      <div className="z-20 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            GymSys
          </span>
        </div>
        
        {/* Registration Card */}
        <div className="backdrop-blur-md bg-gray-800/40 rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h2>
            <p className="text-gray-400 text-center mb-8">Join us to start your fitness journey</p>
            
            {/* Form Steps Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${formStep >= 1 ? 'bg-primary' : 'bg-gray-700'} text-white`}>
                  <span>1</span>
                </div>
                <div className={`h-1 w-16 ${formStep >= 2 ? 'bg-primary' : 'bg-gray-700'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${formStep >= 2 ? 'bg-primary' : 'bg-gray-700'} text-white`}>
                  <span>2</span>
                </div>
              </div>
            </div>
            
            {errors.general && (
              <div className="mb-6 p-3 rounded bg-red-900/30 border border-red-800 text-red-200 text-sm">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={formStep === 1 ? handleNextStep : handleSubmit} className="space-y-6">
              {formStep === 1 ? (
                // Step 1: Account Details
                <>
                  {/* Username Field */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className={`block w-full rounded-md border-0 bg-gray-700/50 py-3 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] ${errors.username ? 'ring-2 ring-red-500/50' : ''}`}
                        placeholder="Choose a username"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> 
                        {errors.username}
                      </p>
                    )}
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full rounded-md border-0 bg-gray-700/50 py-3 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] ${errors.email ? 'ring-2 ring-red-500/50' : ''}`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> 
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full rounded-md border-0 bg-gray-700/50 py-3 pl-10 pr-10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] ${errors.password ? 'ring-2 ring-red-500/50' : ''}`}
                        placeholder="Create a password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-300 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              passwordStrength <= 25 ? 'bg-red-500' : 
                              passwordStrength <= 50 ? 'bg-yellow-500' : 
                              passwordStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {passwordStrength <= 25 && 'Weak password'}
                          {passwordStrength > 25 && passwordStrength <= 50 && 'Moderate password'}
                          {passwordStrength > 50 && passwordStrength <= 75 && 'Good password'}
                          {passwordStrength > 75 && 'Strong password'}
                        </p>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> 
                        {errors.password}
                      </p>
                    )}
                  </div>
                  
                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full rounded-md border-0 bg-gray-700/50 py-3 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] ${errors.confirmPassword ? 'ring-2 ring-red-500/50' : ''}`}
                        placeholder="Confirm your password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> 
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                // Step 2: Personal Information
                <>
                  <button 
                    type="button" 
                    onClick={handlePrevStep}
                    className="flex items-center text-primary hover:text-primary-light mb-4"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Account Details
                  </button>
                  
                  {/* Phone Field (Optional) */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AtSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full rounded-md border-0 bg-gray-700/50 py-3 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 focus:shadow-[0_0_15px_rgba(22,93,255,0.3)] ${errors.phone ? 'ring-2 ring-red-500/50' : ''}`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> 
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </>
              )}
              
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating account...' : formStep === 1 ? 'Continue' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-4 bg-gray-900/70 border-t border-gray-700/50 text-sm text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-light transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 