import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const { Header } = Layout;

const AppHeader = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();

  const menuItems = [
    { key: 'home', label: t('nav.home'), to: '/' },
    { key: 'courses', label: t('nav.courses'), to: '/courses' },
    { key: 'schedule', label: t('nav.schedule'), to: '/schedule' },
    { key: 'membership', label: t('nav.membership'), to: '/membership' },
  ];

  const authItems = isAuthenticated
    ? [
        { key: 'profile', label: t('common.profile'), to: '/profile' },
        { 
          key: 'logout', 
          label: t('common.logout'),
          onClick: logout 
        },
      ]
    : [
        { key: 'login', label: t('common.login'), to: '/login' },
        { key: 'register', label: t('common.register'), to: '/register' },
      ];

  return (
    <Header className="bg-white shadow">
      <div className="container mx-auto flex justify-between items-center">
        <div className="logo">
          <Link to="/" className="text-xl font-bold">
            GymSys
          </Link>
        </div>
        <Menu mode="horizontal" className="flex-1 justify-center">
          {menuItems.map(item => (
            <Menu.Item key={item.key}>
              <Link to={item.to}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Menu mode="horizontal">
            {authItems.map(item => (
              <Menu.Item key={item.key}>
                {item.to ? (
                  <Link to={item.to}>{item.label}</Link>
                ) : (
                  <span onClick={item.onClick}>{item.label}</span>
                )}
              </Menu.Item>
            ))}
          </Menu>
        </div>
      </div>
    </Header>
  );
};

export default AppHeader; 