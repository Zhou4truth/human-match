import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, List, Avatar, Spin, Tabs, Empty, Tag } from 'antd';
import { UserOutlined, PictureOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../utils/AuthContext';
import { imagesAPI } from '../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserProfile = () => {
  const { user } = useAuth();
  const [matchHistory, setMatchHistory] = useState([]);
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch match history
        const matchResponse = await imagesAPI.getMatchHistory();
        setMatchHistory(matchResponse.data);
        
        // Fetch user images
        const imagesResponse = await imagesAPI.getUserImages();
        setUserImages(imagesResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>User Profile</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={4} md={3} lg={2}>
            <Avatar size={80} icon={<UserOutlined />} />
          </Col>
          <Col xs={24} sm={20} md={21} lg={22}>
            <Title level={4}>{user?.full_name || user?.username}</Title>
            <Text type="secondary">{user?.email}</Text>
            {user?.is_admin && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                Administrator
              </Tag>
            )}
          </Col>
        </Row>
      </Card>
      
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic 
              title="Total Uploads" 
              value={user?.total_uploads || 0} 
              prefix={<PictureOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic 
              title="Successful Matches" 
              value={user?.total_matches || 0} 
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic 
              title="Match Success Rate" 
              value={user?.total_uploads > 0 ? Math.round((user?.total_matches / user?.total_uploads) * 100) : 0} 
              suffix="%" 
            />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Tabs defaultActiveKey="history">
          <TabPane tab="Match History" key="history">
            {matchHistory.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={matchHistory}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          src={`/uploads/${item.matched_image.filepath.split('/').pop()}`} 
                          icon={<UserOutlined />}
                        />
                      }
                      title={`Match ID: ${item.id}`}
                      description={
                        <>
                          <div>Similarity Score: {(item.similarity_score * 100).toFixed(2)}%</div>
                          <div>Match Date: {new Date(item.match_date).toLocaleString()}</div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No match history found" />
            )}
          </TabPane>
          <TabPane tab="Uploaded Images" key="images">
            {userImages.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={userImages}
                renderItem={item => (
                  <List.Item>
                    <Card
                      cover={
                        <img 
                          alt={item.filename} 
                          src={`/uploads/${item.filepath.split('/').pop()}`}
                          style={{ height: 200, objectFit: 'cover' }}
                        />
                      }
                    >
                      <Card.Meta
                        title={item.filename}
                        description={
                          <>
                            <div>Uploaded: {new Date(item.created_at).toLocaleString()}</div>
                            {item.is_reference && <Tag color="green">Reference Image</Tag>}
                          </>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No images uploaded yet" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserProfile;
