import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Clock, CalendarClock, ChevronDown, 
  ArrowUpDown, CreditCard, CheckCircle, XCircle, ArrowRight,
  ShoppingCart, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';

// 示例数据 (实际应用中会从API获取)
const ordersData = [
  {
    id: 10045,
    type: 'Membership',
    plan: 'Premium',
    planDuration: 'Monthly',
    amount: 89.99,
    date: '2023-10-15T14:30:00Z',
    status: 'completed',
    paymentMethod: 'Credit Card',
    cardLast4: '4242'
  },
  {
    id: 10044,
    type: 'Course',
    courseName: 'High-Intensity Interval Training',
    sessions: 12,
    amount: 149.99,
    date: '2023-10-10T09:15:00Z',
    status: 'completed',
    paymentMethod: 'PayPal'
  },
  {
    id: 10043,
    type: 'Membership',
    plan: 'Elite',
    planDuration: 'Annual',
    amount: 1529.89,
    date: '2023-09-01T10:20:00Z',
    status: 'completed',
    paymentMethod: 'Credit Card',
    cardLast4: '1234'
  },
  {
    id: 10042,
    type: 'Personal Training',
    sessions: 5,
    trainer: 'Mike Peterson',
    amount: 249.99,
    date: '2023-08-25T16:45:00Z',
    status: 'completed',
    paymentMethod: 'Credit Card',
    cardLast4: '5678'
  },
  {
    id: 10041,
    type: 'Course',
    courseName: 'Yoga Flow',
    sessions: 8,
    amount: 119.99,
    date: '2023-08-15T11:30:00Z',
    status: 'processing',
    paymentMethod: 'PayPal'
  },
  {
    id: 10040,
    type: 'Merchandise',
    items: ['Gym T-shirt', 'Water Bottle'],
    amount: 45.99,
    date: '2023-08-10T13:20:00Z',
    status: 'failed',
    paymentMethod: 'Credit Card',
    cardLast4: '9012'
  },
  {
    id: 10039,
    type: 'Membership',
    plan: 'Basic',
    planDuration: 'Monthly',
    amount: 49.99,
    date: '2023-07-01T09:00:00Z',
    status: 'refunded',
    paymentMethod: 'Credit Card',
    cardLast4: '3456'
  }
];

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'paid':
      case 'completed':
        return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'processing':
      case 'pending':
        return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'cancelled':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
      case 'failed':
        return 'bg-red-900/50 text-red-300 border-red-700/50';
      case 'refunded':
        return 'bg-purple-900/50 text-purple-300 border-purple-700/50';
      default:
        return 'bg-gray-700/50 text-gray-300 border-gray-600/50';
    }
  };
  
  const getStatusIcon = () => {
    switch(status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'cancelled':
        return <CalendarClock className="w-3.5 h-3.5 mr-1" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 mr-1" />;
      case 'refunded':
        return <CreditCard className="w-3.5 h-3.5 mr-1" />;
      default:
        return null;
    }
  };
  
  // Convert backend English status to display text
  const getStatusText = () => {
    switch(status) {
      case 'paid':
        return 'Paid';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Payment Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border ${getStatusStyles()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
};

// Order Row Component
const OrderRow = ({ order }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Time';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get order title based on type
  const getOrderTitle = () => {
    const orderItems = order.items || [];
    const firstItem = orderItems.length > 0 ? orderItems[0] : null;
    
    switch(order.order_type) {
      case 'membership':
        const membershipPlan = firstItem?.membership_plan || {};
        return `${membershipPlan.name || 'Membership'} ${getChineseType(membershipPlan.plan_type || '')}`;
      case 'course':
        const courseName = firstItem?.course?.name || firstItem?.item_name || 'Course';
        return `${courseName} (${orderItems.length} items)`;
      case 'product':
        return orderItems.map(item => item.item_name).join(', ') || 'Product';
      default:
        return `Order #${order.order_id || order.id}`;
    }
  };
  
  // Convert English type to display text
  const getChineseType = (type) => {
    switch(type) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      case 'custom': return 'Custom';
      default: return type;
    }
  };
  
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:border-gray-600 mb-4">
      <div className="p-5">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{getOrderTitle()}</h3>
            <div className="text-gray-400 text-sm flex items-center mt-1">
              <span className="mr-2">Order #${order.order_id || order.id}</span>
              <span>•</span>
              <span className="mx-2">{formatDate(order.created_at || order.date)}</span>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        
        <div className="flex flex-wrap justify-between items-end mt-4">
          <div className="flex items-center text-gray-400 text-sm">
            <CreditCard className="w-4 h-4 mr-1" />
            <span>
              {getPaymentMethodText(order.payment_method)} 
              {order.payment_id && ` • ${order.payment_id.substring(0, 4)}...`}
            </span>
          </div>
          
          <div className="flex items-center">
            <div className="mr-4">
              <span className="font-bold text-lg text-white">${Number(order.actual_amount || order.amount || 0).toFixed(2)}</span>
            </div>
            
            <Link 
              to={`/orders/${order.id}`}
              className="flex items-center justify-center py-2 px-4 bg-primary hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors duration-200"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Convert payment method to display text
const getPaymentMethodText = (method) => {
  switch(method) {
    case 'wechat': return 'WeChat Pay';
    case 'alipay': return 'Alipay';
    case 'cash': return 'Cash';
    case 'card': return 'Bank Card';
    case 'Credit Card': return 'Credit Card';
    case 'PayPal': return 'PayPal';
    default: return method || 'Unknown Payment Method';
  }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // 获取订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/orders/');
        const ordersData = Array.isArray(res.data) ? res.data : 
                          (res.data.results ? res.data.results : []);
        
        setOrders(ordersData);
      } catch (error) {
        console.error("获取订单失败:", error);
        message.error('获取订单失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // 应用筛选和排序
  useEffect(() => {
    let result = [...orders];
    
    // 应用状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // 应用类型筛选
    if (typeFilter !== 'all') {
      result = result.filter(order => order.order_type === typeFilter);
    }
    
    // 应用搜索筛选
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => {
        // 搜索订单号
        const orderIdMatch = (order.order_id || '').toString().toLowerCase().includes(query);
        
        // 搜索订单项目名称
        const itemsMatch = (order.items || []).some(item => 
          (item.item_name || '').toLowerCase().includes(query)
        );
        
        return orderIdMatch || itemsMatch;
      });
    }
    
    // 应用排序
    switch(sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date));
        break;
      case 'date-desc':
        result.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
        break;
      case 'amount-asc':
        result.sort((a, b) => (a.actual_amount || a.amount || 0) - (b.actual_amount || b.amount || 0));
        break;
      case 'amount-desc':
        result.sort((a, b) => (b.actual_amount || b.amount || 0) - (a.actual_amount || a.amount || 0));
        break;
      default:
        // 默认按日期降序排序
        result.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
    }
    
    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter, typeFilter, sortBy]);
  
  // 加载状态
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-semibold text-white">Loading orders...</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">My Orders</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          View and manage your order history, including membership plans, courses, and other purchases.
        </p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search order number or product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="relative inline-block text-left">
              <button
                className="flex items-center gap-2 py-2 px-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-600/50 transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>Status: {statusFilter === 'all' ? 'All' : getStatusFilterText(statusFilter)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 hidden group-focus:block group-hover:block">
                <div className="p-2">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      statusFilter === 'all' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setStatusFilter('paid')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      statusFilter === 'paid' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Paid
                  </button>
                  <button 
                    onClick={() => setStatusFilter('pending')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      statusFilter === 'pending' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => setStatusFilter('cancelled')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      statusFilter === 'cancelled' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Cancelled
                  </button>
                  <button 
                    onClick={() => setStatusFilter('refunded')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      statusFilter === 'refunded' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Refunded
                  </button>
                </div>
              </div>
            </div>
            
            {/* Type Filter */}
            <div className="relative inline-block text-left">
              <button
                className="flex items-center gap-2 py-2 px-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-600/50 transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>Type: {typeFilter === 'all' ? 'All' : getTypeFilterText(typeFilter)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 hidden group-focus:block group-hover:block">
                <div className="p-2">
                  <button 
                    onClick={() => setTypeFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      typeFilter === 'all' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setTypeFilter('membership')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      typeFilter === 'membership' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Membership
                  </button>
                  <button 
                    onClick={() => setTypeFilter('course')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      typeFilter === 'course' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Course
                  </button>
                  <button 
                    onClick={() => setTypeFilter('product')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      typeFilter === 'product' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Product
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sort By */}
            <div className="relative inline-block text-left">
              <button
                className="flex items-center gap-2 py-2 px-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-600/50 transition-colors duration-200"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Sort: {getSortByText(sortBy)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 hidden group-focus:block group-hover:block">
                <div className="p-2">
                  <button 
                    onClick={() => setSortBy('date-desc')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      sortBy === 'date-desc' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Date (Newest First)
                  </button>
                  <button 
                    onClick={() => setSortBy('date-asc')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      sortBy === 'date-asc' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Date (Oldest First)
                  </button>
                  <button 
                    onClick={() => setSortBy('amount-desc')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      sortBy === 'amount-desc' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Amount (Highest)
                  </button>
                  <button 
                    onClick={() => setSortBy('amount-asc')}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      sortBy === 'amount-asc' 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Amount (Lowest)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders List */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'No orders found that match the current filter. Try adjusting the filters.'
                : 'You have not created any orders yet. Explore our courses and membership plans to start your fitness journey.'}
            </p>
            {!(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Link 
                to="/courses"
                className="inline-flex items-center justify-center py-2 px-4 bg-primary hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors duration-200"
              >
                Browse Courses
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function - Get status filter text
const getStatusFilterText = (status) => {
  switch(status) {
    case 'paid': return 'Paid';
    case 'pending': return 'Pending';
    case 'cancelled': return 'Cancelled';
    case 'refunded': return 'Refunded';
    default: return status;
  }
};

// Helper function - Get type filter text
const getTypeFilterText = (type) => {
  switch(type) {
    case 'membership': return 'Membership';
    case 'course': return 'Course';
    case 'product': return 'Product';
    default: return type;
  }
};

// Helper function - Get sort text
const getSortByText = (sortBy) => {
  switch(sortBy) {
    case 'date-desc': return 'Newest First';
    case 'date-asc': return 'Oldest First';
    case 'amount-desc': return 'Highest Amount';
    case 'amount-asc': return 'Lowest Amount';
    default: return 'Newest First';
  }
};

export default OrdersPage; 