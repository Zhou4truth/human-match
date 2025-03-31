import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  SearchOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (key) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: '1',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
        }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'HM' : 'Human Match'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'profile']}
          items={[
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: 'User Profile',
              onClick: () => handleMenuClick('profile'),
            },
            {
              key: 'upload',
              icon: <UploadOutlined />,
              label: 'Upload',
              onClick: () => handleMenuClick('upload'),
            },
            {
              key: 'match',
              icon: <SearchOutlined />,
              label: 'Match',
              onClick: () => handleMenuClick('match'),
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSider}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {user && (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8 }}>{user.username}</span>
                  <Avatar icon={<UserOutlined />} />
                </div>
              </Dropdown>
            )}
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
