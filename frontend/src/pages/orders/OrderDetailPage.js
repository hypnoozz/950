import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, CreditCard, CheckCircle, XCircle, CalendarClock,
  Download, Printer, MessageCircle, FileText, ShoppingBag, User, MapPin
} from 'lucide-react';

// 示例订单详情数据 (实际应用中会从API获取)
const ordersData = [
  {
    id: 10045,
    type: 'Membership',
    plan: 'Premium',
    planDuration: 'Monthly',
    amount: 89.99,
    tax: 7.20,
    discount: 0,
    total: 97.19,
    date: '2023-10-15T14:30:00Z',
    status: 'completed',
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    cardBrand: 'Visa',
    billingAddress: {
      name: 'John Smith',
      address: '123 Main St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    items: [
      {
        id: 1,
        name: 'Premium Membership (Monthly)',
        description: 'Access to all gym facilities and unlimited group classes',
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99
      }
    ],
    invoiceNumber: 'INV-2023-10045',
    notes: 'Recurring payment for monthly membership'
  },
  {
    id: 10044,
    type: 'Course',
    courseName: 'High-Intensity Interval Training',
    startDate: '2023-10-20T00:00:00Z',
    endDate: '2023-12-15T00:00:00Z',
    sessions: 12,
    amount: 149.99,
    tax: 12.00,
    discount: 15.00,
    total: 146.99,
    date: '2023-10-10T09:15:00Z',
    status: 'completed',
    paymentMethod: 'PayPal',
    paypalEmail: 'john.smith@example.com',
    billingAddress: {
      name: 'John Smith',
      address: '123 Main St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    items: [
      {
        id: 1,
        name: 'High-Intensity Interval Training',
        description: '12 sessions with Sarah Johnson',
        quantity: 1,
        unitPrice: 149.99,
        totalPrice: 149.99
      }
    ],
    invoiceNumber: 'INV-2023-10044',
    notes: 'Applied discount code: NEWYEAR15'
  }
];

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'completed':
        return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'processing':
        return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'pending':
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
      case 'completed':
        return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case 'processing':
        return <Clock className="w-4 h-4 mr-1.5" />;
      case 'pending':
        return <CalendarClock className="w-4 h-4 mr-1.5" />;
      case 'failed':
        return <XCircle className="w-4 h-4 mr-1.5" />;
      case 'refunded':
        return <CreditCard className="w-4 h-4 mr-1.5" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center border ${getStatusStyles()}`}>
      {getStatusIcon()}
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from an API
        // const response = await api.get(`/orders/${id}`);
        // setOrder(response.data);
        
        // Using mock data for now
        const foundOrder = ordersData.find(o => o.id === parseInt(id, 10));
        setOrder(foundOrder);
      } catch (error) {
        console.error("Error fetching order:", error);
        // Handle error state
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-200">Order not found</h2>
          <p className="mt-4 text-gray-400">The order you're looking for doesn't exist or has been removed.</p>
          <Link to="/orders" className="mt-6 inline-block px-6 py-2 bg-primary hover:bg-blue-600 rounded-lg transition-colors">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  // Function to get title based on order type
  const getOrderTitle = () => {
    switch(order.type) {
      case 'Membership':
        return `${order.plan} Membership (${order.planDuration})`;
      case 'Course':
        return `${order.courseName} (${order.sessions} sessions)`;
      case 'Personal Training':
        return `Personal Training (${order.sessions} sessions)`;
      case 'Merchandise':
        return 'Merchandise Purchase';
      default:
        return order.type;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/orders" className="flex items-center text-gray-400 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Orders</span>
        </Link>
      </div>
      
      {/* Order Header */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{getOrderTitle()}</h1>
            <div className="text-gray-400 mt-1">Order #{order.id} • {order.invoiceNumber}</div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        
        <div className="flex flex-wrap gap-6 text-gray-300">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            <span>Placed on {formatDate(order.date)}</span>
          </div>
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            <span>
              {order.paymentMethod} 
              {order.cardLast4 && ` •••• ${order.cardLast4}`}
              {order.cardBrand && ` (${order.cardBrand})`}
              {order.paypalEmail && ` (${order.paypalEmail})`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Order Items */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-primary" />
              Order Items
            </h2>
            
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-gray-400 text-sm">
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-sm">Unit Price</div>
                        <div className="font-medium text-white">${item.unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <div className="text-gray-400 text-sm">Total</div>
                        <div className="font-medium text-white">${item.totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Course Specific Details */}
            {order.type === 'Course' && order.startDate && (
              <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Course Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start">
                    <CalendarClock className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-gray-400">Start Date</span>
                      <span className="text-white">{formatDate(order.startDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CalendarClock className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-gray-400">End Date</span>
                      <span className="text-white">{formatDate(order.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Order Notes */}
            {order.notes && (
              <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="flex items-start">
                  <MessageCircle className="w-5 h-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Notes</h4>
                    <p className="text-gray-400 text-sm">{order.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Billing Address */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Billing Details
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                  Billing Address
                </h3>
                <div className="text-gray-300 space-y-1 text-sm">
                  <p className="font-medium text-white">{order.billingAddress.name}</p>
                  <p>{order.billingAddress.address}</p>
                  <p>{`${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.zipCode}`}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1.5 text-primary" />
                  Payment Method
                </h3>
                <div className="text-gray-300 space-y-1 text-sm">
                  <p className="font-medium text-white">{order.paymentMethod}</p>
                  {order.cardLast4 && (
                    <p>{order.cardBrand} ending in {order.cardLast4}</p>
                  )}
                  {order.paypalEmail && (
                    <p>PayPal account: {order.paypalEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Order Summary */}
          <div className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 mb-8 border border-primary/20 sticky top-24 shadow-glow-primary">
            <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
            
            {/* Summary Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white">${order.amount.toFixed(2)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount:</span>
                  <span className="text-green-400">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax:</span>
                <span className="text-white">${order.tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-medium pt-3 border-t border-gray-700">
                <span className="text-white">Total:</span>
                <span className="text-white text-lg">${order.total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full py-2.5 px-4 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </button>
              
              <button className="w-full py-2.5 px-4 bg-transparent hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-600 flex items-center justify-center transition-colors">
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </button>
              
              {order.status === 'completed' && order.type === 'Membership' && (
                <button className="w-full py-2.5 px-4 bg-transparent hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-600 flex items-center justify-center transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  View Membership Details
                </button>
              )}
              
              {order.status === 'completed' && order.type === 'Course' && (
                <button className="w-full py-2.5 px-4 bg-transparent hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-600 flex items-center justify-center transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  View Course Schedule
                </button>
              )}
            </div>
            
            {/* Support Info */}
            <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400">
              <p className="mb-2">Need help with this order?</p>
              <a href="#" className="text-primary hover:text-blue-400 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 