import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchMembershipPlans, purchaseMembership } from '../services/membershipService';
import { Card, Button, message, Modal } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import '../styles/MembershipPage.css';

const MembershipPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMembershipPlans();
  }, []);

  const loadMembershipPlans = async () => {
    try {
      const data = await fetchMembershipPlans();
      setPlans(data);
    } catch (error) {
      message.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan) => {
    if (!isAuthenticated) {
      message.warning('Please login to purchase a membership');
      navigate('/login');
      return;
    }

    setSelectedPlan(plan);
    setIsModalVisible(true);
  };

  const confirmPurchase = async () => {
    try {
      await purchaseMembership(selectedPlan.id);
      message.success('Successfully purchased membership');
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to purchase membership');
    }
  };

  return (
    <div className="membership-page">
      <div className="membership-header">
        <h1>Membership Plans</h1>
        <p>Choose the perfect plan for your fitness journey</p>
      </div>

      <div className="membership-grid">
        {plans.map(plan => (
          <Card
            key={plan.id}
            className="membership-card"
            loading={loading}
          >
            <div className="plan-header">
              <h2>{plan.name}</h2>
              <div className="plan-price">
                <span className="price">${plan.price}</span>
                <span className="duration">/ {plan.duration_days} days</span>
              </div>
            </div>

            <div className="plan-description">
              <p>{plan.description}</p>
            </div>

            <div className="plan-features">
              <div className="feature">
                <CheckCircleOutlined /> Access to all courses
              </div>
              <div className="feature">
                <CheckCircleOutlined /> Priority booking
              </div>
              <div className="feature">
                <CheckCircleOutlined /> Free fitness assessment
              </div>
              <div className="feature">
                <ClockCircleOutlined /> {plan.duration_days} days validity
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={() => handlePurchase(plan)}
              className="purchase-button"
            >
              Purchase Now
            </Button>
          </Card>
        ))}
      </div>

      <Modal
        title="Confirm Purchase"
        open={isModalVisible}
        onOk={confirmPurchase}
        onCancel={() => setIsModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        {selectedPlan && (
          <div className="purchase-confirmation">
            <h3>{selectedPlan.name}</h3>
            <p>{selectedPlan.description}</p>
            <div className="purchase-details">
              <p>Price: ${selectedPlan.price}</p>
              <p>Duration: {selectedPlan.duration_days} days</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MembershipPage; 