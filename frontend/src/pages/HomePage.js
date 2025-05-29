import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ChevronRight, Star, Users, Calendar, Clock, ChevronLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Sample data (would come from API in production)
const featuredCourses = [
  {
    id: 1,
    title: 'High-Intensity Interval Training',
    description: 'Boost your metabolism and burn calories with our expert-led HIIT sessions',
    instructor: 'Sarah Johnson',
    duration: '45 min',
    level: 'Intermediate',
    rating: 4.8,
    image: '/images/course-1.jpg',
    category: 'Cardio'
  },
  {
    id: 2,
    title: 'Strength Foundation',
    description: 'Build core strength and improve posture with fundamental strength training',
    instructor: 'Mike Peterson',
    duration: '60 min',
    level: 'Beginner',
    rating: 4.6,
    image: '/images/course-2.jpg',
    category: 'Strength'
  },
  {
    id: 3,
    title: 'Yoga Flow',
    description: 'Find your center with dynamic vinyasa flows and mindful movement',
    instructor: 'Emma Chen',
    duration: '75 min',
    level: 'All Levels',
    rating: 4.9,
    image: '/images/course-3.jpg',
    category: 'Flexibility'
  }
];

const membershipPlans = [
  {
    id: 1,
    name: 'Basic',
    price: 49,
    period: 'month',
    features: [
      'Access to gym facilities',
      '2 group classes per week',
      'Locker access',
      'Fitness assessment'
    ],
    recommended: false,
    color: 'bg-gray-700'
  },
  {
    id: 2,
    name: 'Premium',
    price: 89,
    period: 'month',
    features: [
      'Unlimited gym access',
      'Unlimited group classes',
      'Personal trainer (2 sessions)',
      'Nutritional guidance',
      'Access to spa facilities'
    ],
    recommended: true,
    color: 'bg-primary'
  },
  {
    id: 3,
    name: 'Elite',
    price: 149,
    period: 'month',
    features: [
      'VIP gym access 24/7',
      'All Premium features',
      'Personal trainer (5 sessions)',
      'Custom workout programs',
      'Custom nutrition plan',
      'Recovery therapies'
    ],
    recommended: false,
    color: 'bg-gray-700'
  }
];

// Course Card Component
const CourseCard = ({ course }) => (
  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 group h-full flex flex-col transform hover:-translate-y-1">
    <div className="h-48 w-full overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent opacity-60 z-10"></div>
      <img 
        src={course.image || 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'} 
        alt={course.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full z-20 border border-gray-700">
        {course.category}
      </div>
    </div>
    
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-white leading-tight">{course.title}</h3>
        <div className="flex items-center text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="ml-1 text-sm">{course.rating}</span>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-4 flex-grow">{course.description}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          <span>{course.instructor}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{course.duration}</span>
        </div>
      </div>
      
      <Link 
        to={`/courses/${course.id}`}
        className="mt-auto flex items-center justify-center py-2 px-4 bg-gray-700 hover:bg-primary rounded-lg text-white text-sm font-medium transition-colors duration-200"
      >
        View Details
        <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </div>
);

// Membership Plan Card Component
const MembershipCard = ({ plan }) => (
  <div className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 border border-gray-700/50 flex flex-col transform hover:-translate-y-2 ${plan.recommended ? 'ring-2 ring-secondary relative z-10 scale-105' : ''}`}>
    <div className={`${plan.color} px-6 py-8 text-center`}>
      {plan.recommended && (
        <div className="bg-secondary text-xs font-bold text-white px-3 py-1 rounded-full absolute top-4 left-1/2 transform -translate-x-1/2">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
      <div className="flex items-center justify-center mt-2">
        <span className="text-4xl font-bold text-white">${plan.price}</span>
        <span className="text-gray-300 ml-2">/{plan.period}</span>
      </div>
    </div>
    
    <div className="p-6 bg-gray-800/80 backdrop-blur-sm flex-grow flex flex-col">
      <ul className="space-y-3 mb-6 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start text-gray-300">
            <span className="text-secondary mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <Link 
        to="/membership"
        className={`mt-auto flex items-center justify-center py-3 px-4 ${plan.recommended ? 'bg-secondary hover:bg-secondary/90' : 'bg-gray-700 hover:bg-primary'} rounded-lg text-white font-medium transition-colors duration-200`}
      >
        Choose Plan
      </Link>
    </div>
  </div>
);

// Main Home Page Component
const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Transform Your Fitness Journey",
      subtitle: "Join our state-of-the-art facilities and expert-led programs",
      image: "url('/images/hero-1.jpg')",
      cta: "Get Started"
    },
    {
      title: "Achieve Your Goals Faster",
      subtitle: "Personalized training and cutting-edge equipment",
      image: "url('/images/hero-2.jpg')",
      cta: "Join Today"
    },
    {
      title: "Community. Strength. Results.",
      subtitle: "Be part of a motivating fitness community",
      image: "url('/images/hero-3.jpg')",
      cta: "Explore Membership"
    }
  ];
  
  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  
  return (
    <div>
      {/* Hero Section with Carousel */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Background Slides */}
        {heroSlides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: slide.image || "url('https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
          </div>
        ))}
        
        {/* Content */}
        <div className="relative h-full flex items-center z-10">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl transition-all duration-700 transform translate-y-0 opacity-100">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                {heroSlides[currentSlide].subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to={isAuthenticated ? "/courses" : "/register"}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-200 flex items-center"
                >
                  {heroSlides[currentSlide].cta}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/membership"
                  className="bg-transparent text-white font-bold py-3 px-8 rounded-lg border border-white/30 hover:bg-white/10 transition-all duration-200"
                >
                  View Plans
                </Link>
              </div>
              
              {/* Slide Indicators */}
              <div className="flex mt-10 space-x-3">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      currentSlide === index ? 'w-10 bg-primary' : 'w-5 bg-gray-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-2 hover:bg-primary transition-colors duration-200"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white rounded-full p-2 hover:bg-primary transition-colors duration-200"
          onClick={nextSlide}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>
      
      {/* Features Overview */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">GymSys</span></h2>
            <p className="text-gray-400">Experience fitness redefined with cutting-edge technology and personalized training solutions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Advanced Equipment</h3>
              <p className="text-gray-400">State-of-the-art fitness equipment designed for optimal performance and results.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Expert Trainers</h3>
              <p className="text-gray-400">Certified professionals dedicated to helping you achieve your fitness goals safely and effectively.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Flexible Scheduling</h3>
              <p className="text-gray-400">Book classes and sessions at your convenience with our easy-to-use digital platform.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Courses */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Featured Courses</h2>
              <p className="text-gray-400">Discover our most popular training programs</p>
            </div>
            <Link to="/courses" className="inline-flex items-center text-primary hover:text-primary-light font-semibold">
              View All Courses
              <ChevronRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Membership Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Background Design Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Membership Plans</h2>
            <p className="text-gray-400">Choose the plan that fits your fitness journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipPlans.map(plan => (
              <MembershipCard key={plan.id} plan={plan} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/membership" 
              className="inline-flex items-center text-primary hover:text-primary-light font-semibold"
            >
              Compare All Plans
              <ChevronDown className="ml-1 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50">
        <div className="container mx-auto px-6">
          <div className="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-12 border border-gray-700/50 relative overflow-hidden shadow-2xl">
            {/* Design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:max-w-2xl mb-8 lg:mb-0 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Ready to Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Fitness Journey</span>?
                </h2>
                <p className="text-gray-300 text-lg mb-0">
                  Join today and get access to all our premium features for 30 days.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register" 
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-200"
                >
                  Sign Up Now
                </Link>
                <Link 
                  to="/contact" 
                  className="bg-transparent text-white font-bold py-3 px-8 rounded-lg border border-white/30 hover:bg-white/10 transition-all duration-200"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 