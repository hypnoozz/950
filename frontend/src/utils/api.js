import axios from 'axios';

// 创建配置好的axios实例
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从本地存储获取令牌
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      const { access } = JSON.parse(tokens);
      config.headers['Authorization'] = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 获取原始请求配置
    const originalRequest = error.config;
    
    // 如果错误是由于401未授权造成的，并且之前没有尝试过刷新令牌
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 从本地存储获取刷新令牌
        const tokens = localStorage.getItem('tokens');
        if (!tokens) {
          // 如果没有令牌，则抛出错误
          return Promise.reject(error);
        }
        
        const { refresh } = JSON.parse(tokens);
        
        // 尝试刷新令牌
        const response = await axios.post('/api/token/refresh/', { refresh });
        const { access } = response.data;
        
        // 更新本地存储中的令牌
        const newTokens = { access, refresh };
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        
        // 更新原始请求的授权头
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // 重试原始请求
        return api(originalRequest);
      } catch (refreshError) {
        // 如果刷新令牌失败，清除本地存储
        localStorage.removeItem('tokens');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 用户相关API
export const userApi = {
  getCurrentUser: () => api.get('/users/me/'),
  updateUser: (userId, data) => api.patch(`/users/${userId}/`, data),
  updateProfile: (userId, data) => api.patch(`/users/profile/${userId}/`, data),
  changePassword: (data) => api.post('/users/change-password/', data),
};

// 课程相关API
export const courseApi = {
  getCourses: (params) => api.get('/courses/', { params }),
  getCourseById: (id) => api.get(`/courses/${id}/`),
  getCourseCategories: () => api.get('/courses/categories/'),
  getCourseSchedules: (params) => api.get('/courses/schedules/', { params }),
  enrollCourse: (data) => api.post('/courses/enrollments/', data),
  getUserEnrollments: () => api.get('/courses/enrollments/'),
  cancelEnrollment: (id) => api.patch(`/courses/enrollments/${id}/`, { status: 'cancelled' }),
};

// 会员套餐相关API
export const membershipApi = {
  getMembershipPlans: () => api.get('/orders/membership-plans/'),
  getMembershipPlanById: (id) => api.get(`/orders/membership-plans/${id}/`),
};

// 订单相关API
export const orderApi = {
  createOrder: (data) => api.post('/orders/', data),
  getOrders: (params) => api.get('/orders/', { params }),
  getOrderById: (id) => api.get(`/orders/${id}/`),
  updateOrder: (id, data) => api.patch(`/orders/${id}/`, data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
};

export default api; 