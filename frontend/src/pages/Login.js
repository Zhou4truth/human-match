import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const { Title } = Typography;
const { Content } = Layout;

const Login = () => {
  const { login, isAuthenticated, error, loading } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const onFinish = async (values) => {
    const { username, password } = values;
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setLoginError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card 
          style={{ 
            width: 400, 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>Human Match</Title>
            <p style={{ color: '#888', marginTop: 8 }}>Facial Recognition System</p>
          </div>
          
          {(error || loginError) && (
            <Alert
              message="Error"
              description={error || loginError}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}
          
          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Username" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ width: '100%' }}
                size="large"
                loading={loading}
              >
                Log in
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center' }}>
              <p>Demo credentials:</p>
              <p><strong>Username:</strong> admin | <strong>Password:</strong> 123456</p>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
