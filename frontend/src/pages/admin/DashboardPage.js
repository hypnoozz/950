import React, { useState, useEffect } from 'react';
import { Users, Dumbbell, ShoppingCart, CreditCard, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import axios from 'axios';

// 统计卡片组件
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="ml-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </div>
);

// 最近活动组件
const RecentActivity = ({ activities }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
            <activity.icon className="w-4 h-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm">{activity.content}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 图表组件（示例）
const Chart = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">Monthly Statistics</h2>
    <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
      <p className="text-gray-500">Chart component (ECharts or Recharts can be integrated here)</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    schedules: 0
  });
  
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟获取统计数据
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 实际项目中应该从API获取这些数据
        // const response = await axios.get('/api/admin/dashboard/stats');
        // setStats(response.data);
        
        // 模拟数据
        setStats({
          totalMembers: 245,
          totalCourses: 18,
          totalRevenue: 42650,
          schedules: 42
        });
        
        setActivities([
          { 
            icon: Users, 
            color: 'bg-blue-500', 
            content: 'New user Zhang San joined the gym', 
            time: '5 minutes ago' 
          },
          { 
            icon: Dumbbell, 
            color: 'bg-purple-500', 
            content: 'Coach Li created a new course "Advanced Yoga"', 
            time: '30 minutes ago' 
          },
          { 
            icon: ShoppingCart, 
            color: 'bg-green-500', 
            content: 'Wang Wu purchased a quarterly membership package', 
            time: '1 hour ago' 
          },
          { 
            icon: Calendar, 
            color: 'bg-orange-500', 
            content: 'System scheduled 5 new course times', 
            time: '2 hours ago' 
          },
          { 
            icon: Users, 
            color: 'bg-red-500', 
            content: '赵六报名参加了"力量训练"课程', 
            time: '3小时前' 
          }
        ]);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">控制台</h1>
        <p className="text-gray-600">欢迎回来，查看健身房的最新数据和动态</p>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
        <StatCard title="总用户数" value={stats.users} icon={Users} color="bg-blue-500" />
        <StatCard title="当前课程" value={stats.courses} icon={Dumbbell} color="bg-purple-500" />
        <StatCard title="本月订单" value={stats.orders} icon={ShoppingCart} color="bg-green-500" />
        <StatCard title="本月收入" value={`¥${stats.revenue}`} icon={CreditCard} color="bg-yellow-500" />
        <StatCard title="课程排期" value={stats.schedules} icon={Calendar} color="bg-red-500" />
      </div>
      
      {/* 中间内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Chart />
        </div>
        <div>
          <RecentActivity activities={activities} />
        </div>
      </div>
      
      {/* 底部内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">热门课程</h2>
          <div className="space-y-2">
            {[
              { name: '有氧运动', enrollment: 32, instructor: '李教练' },
              { name: '力量训练', enrollment: 28, instructor: '王教练' },
              { name: '瑜伽初级', enrollment: 24, instructor: '赵教练' },
              { name: '普拉提', enrollment: 20, instructor: '张教练' },
              { name: '搏击训练', enrollment: 18, instructor: '刘教练' }
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100">
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-sm text-gray-500">教练: {course.instructor}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{course.enrollment}</p>
                  <p className="text-xs text-gray-500">报名人数</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">待办事项</h2>
          <div className="space-y-3">
            {[
              { task: '审核新教练申请', priority: 'high', due: '今天' },
              { task: '更新会员套餐价格', priority: 'medium', due: '明天' },
              { task: '回复用户反馈', priority: 'medium', due: '明天' },
              { task: '安排下周课程', priority: 'medium', due: '后天' },
              { task: '年度设备检查', priority: 'low', due: '本周五' }
            ].map((todo, index) => (
              <div key={index} className="flex items-center p-3 border-b border-gray-100">
                <input type="checkbox" className="mr-3 form-checkbox rounded text-primary focus:ring-primary" />
                <div className="flex-1">
                  <p className="font-medium">{todo.task}</p>
                  <p className="text-xs text-gray-500">截止: {todo.due}</p>
                </div>
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium 
                  ${todo.priority === 'high' ? 'bg-red-100 text-red-700' : 
                    todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'}
                `}>
                  {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 