import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Select, 
  Empty, 
  Spin, 
  Alert, 
  Progress, 
  Divider, 
  List,
  Tag,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { imagesAPI } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to extract query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const MatchPage = () => {
  const query = useQuery();
  const initialImageId = query.get('imageId');
  
  const [userImages, setUserImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(initialImageId || null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchInProgress, setMatchInProgress] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Fetch user images on component mount
  useEffect(() => {
    const fetchUserImages = async () => {
      try {
        setInitialLoading(true);
        const response = await imagesAPI.getUserImages(false);
        
        // Filter out reference images
        const queryImages = response.data.filter(img => !img.is_reference);
        setUserImages(queryImages);
        
        // If there's an initial image ID, select it
        if (initialImageId) {
          const initialImage = queryImages.find(img => img.id === parseInt(initialImageId));
          if (initialImage) {
            setSelectedImage(initialImage);
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setError('Failed to load images. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchUserImages();
  }, [initialImageId]);

  // Handle image selection
  const handleImageSelect = async (imageId) => {
    setSelectedImageId(imageId);
    setMatchResult(null);
    setError(null);
    
    try {
      setLoading(true);
      const response = await imagesAPI.getImage(imageId);
      setSelectedImage(response.data);
    } catch (error) {
      console.error('Error fetching image details:', error);
      setError('Failed to load image details. Please try again.');
      setSelectedImage(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle match process
  const handleMatch = async () => {
    if (!selectedImageId) {
      setError('Please select an image to match');
      return;
    }
    
    setMatchInProgress(true);
    setProgressPercent(0);
    setMatchResult(null);
    setError(null);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      const response = await imagesAPI.matchImage(selectedImageId);
      clearInterval(progressInterval);
      setProgressPercent(100);
      
      // Short delay to show 100% completion
      setTimeout(() => {
        setMatchResult(response.data);
        setMatchInProgress(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Match error:', error);
      setError(error.response?.data?.detail || 'Failed to perform matching. Please try again.');
      setMatchInProgress(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Match Images</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card title="Select Image to Match">
            {userImages.length > 0 ? (
              <>
                <Select
                  placeholder="Select an image"
                  style={{ width: '100%', marginBottom: 16 }}
                  value={selectedImageId}
                  onChange={handleImageSelect}
                  loading={loading}
                  disabled={matchInProgress}
                >
                  {userImages.map(image => (
                    <Option key={image.id} value={image.id}>
                      {image.filename} ({new Date(image.created_at).toLocaleDateString()})
                    </Option>
                  ))}
                </Select>
                
                {selectedImage && (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={`/uploads/${selectedImage.filepath.split('/').pop()}`}
                      alt="Selected"
                      style={{ maxWidth: '100%', maxHeight: 300, marginBottom: 16 }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <p><strong>Filename:</strong> {selectedImage.filename}</p>
                      <p><strong>Upload Date:</strong> {new Date(selectedImage.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleMatch}
                  disabled={!selectedImageId || matchInProgress}
                  loading={matchInProgress}
                  block
                  style={{ marginTop: 16 }}
                >
                  {matchInProgress ? 'Matching...' : 'Start Matching'}
                </Button>
                
                {matchInProgress && (
                  <div style={{ marginTop: 16 }}>
                    <Progress percent={progressPercent} status="active" />
                    <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                      Comparing with reference database...
                    </Text>
                  </div>
                )}
                
                {error && (
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            ) : (
              <Empty 
                description={
                  <span>
                    No images available for matching. Please <a href="/upload">upload</a> an image first.
                  </span>
                }
              />
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title="Match Results" 
            extra={
              matchResult && (
                <Tag color="green">
                  {(matchResult.similarity_score * 100).toFixed(2)}% Match
                </Tag>
              )
            }
          >
            {matchResult ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img
                    src={`/uploads/${matchResult.matched_image.filepath.split('/').pop()}`}
                    alt="Matched"
                    style={{ maxWidth: '100%', maxHeight: 300 }}
                  />
                </div>
                
                <Divider>Match Details</Divider>
                
                <List>
                  <List.Item>
                    <Text strong>Match ID:</Text>
                    <Text>{matchResult.id}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Similarity Score:</Text>
                    <Text>{(matchResult.similarity_score * 100).toFixed(2)}%</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Match Status:</Text>
                    <Space>
                      {matchResult.similarity_score >= 0.95 ? (
                        <>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <Text type="success">High Confidence Match</Text>
                        </>
                      ) : matchResult.similarity_score >= 0.9 ? (
                        <>
                          <CheckCircleOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary">Probable Match</Text>
                        </>
                      ) : (
                        <>
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                          <Text type="danger">Low Confidence Match</Text>
                        </>
                      )}
                    </Space>
                  </List.Item>
                  <List.Item>
                    <Text strong>Match Date:</Text>
                    <Text>{new Date(matchResult.match_date).toLocaleString()}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Matched Image:</Text>
                    <Text>{matchResult.matched_image.filename}</Text>
                  </List.Item>
                </List>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                height: 300,
                background: '#f5f5f5',
                borderRadius: 4
              }}>
                {matchInProgress ? (
                  <>
                    <LoadingOutlined style={{ fontSize: 48, marginBottom: 24, color: '#1890ff' }} />
                    <Text>Matching in progress...</Text>
                  </>
                ) : (
                  <>
                    <SearchOutlined style={{ fontSize: 48, marginBottom: 24, color: '#d9d9d9' }} />
                    <Text type="secondary">No match results yet</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                      Select an image and click "Start Matching" to find matches
                    </Text>
                  </>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MatchPage;
