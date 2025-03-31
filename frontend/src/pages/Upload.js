import React, { useState } from 'react';
import { 
  Typography, 
  Upload, 
  Button, 
  Card, 
  message, 
  Row, 
  Col, 
  Switch, 
  Space, 
  Divider,
  Alert
} from 'antd';
import { 
  UploadOutlined, 
  InboxOutlined, 
  DatabaseOutlined 
} from '@ant-design/icons';
import { imagesAPI } from '../services/api';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const UploadPage = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isReference, setIsReference] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select an image to upload');
      return;
    }

    const file = fileList[0].originFileObj;
    setUploading(true);
    setError(null);

    try {
      const response = await imagesAPI.uploadImage(file, isReference);
      setUploadedImage(response.data);
      message.success('Image uploaded successfully');
      setFileList([]);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.detail || 'Failed to upload image. Please try again.');
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      
      // Check file size (limit to 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div>
      <Title level={2}>Upload Image</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card title="Upload New Image">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Image Requirements"
                description="Please upload a clear image containing a face. The image should be less than 5MB in size and in JPG, JPEG, or PNG format."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Switch 
                    checked={isReference} 
                    onChange={setIsReference} 
                  />
                  <Text>
                    Add to reference database
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      (Images in the reference database will be used for matching)
                    </Text>
                  </Text>
                </Space>
              </div>
              
              <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag image to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single image upload. Strictly prohibited from uploading company data or other
                  banned files.
                </p>
              </Dragger>
              
              <Button
                type="primary"
                onClick={handleUpload}
                disabled={fileList.length === 0}
                loading={uploading}
                icon={<UploadOutlined />}
                style={{ marginTop: 16 }}
                block
              >
                {uploading ? 'Uploading' : 'Start Upload'}
              </Button>
              
              {error && (
                <Alert
                  message="Upload Error"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title="Uploaded Image" 
            extra={
              uploadedImage && (
                <Tag color={uploadedImage.is_reference ? "green" : "blue"}>
                  {uploadedImage.is_reference ? "Reference Image" : "Query Image"}
                </Tag>
              )
            }
          >
            {uploadedImage ? (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={`/uploads/${uploadedImage.filepath.split('/').pop()}`}
                  alt="Uploaded"
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                />
                <Divider />
                <div style={{ textAlign: 'left' }}>
                  <p><strong>Filename:</strong> {uploadedImage.filename}</p>
                  <p><strong>Upload Date:</strong> {new Date(uploadedImage.created_at).toLocaleString()}</p>
                  <p>
                    <strong>Type:</strong> {uploadedImage.is_reference ? 'Reference Image' : 'Query Image'}
                  </p>
                </div>
                
                {!uploadedImage.is_reference && (
                  <Button 
                    type="primary"
                    icon={<DatabaseOutlined />}
                    onClick={() => {
                      window.location.href = `/match?imageId=${uploadedImage.id}`;
                    }}
                    style={{ marginTop: 16 }}
                  >
                    Match This Image
                  </Button>
                )}
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: 300,
                background: '#f5f5f5',
                borderRadius: 4
              }}>
                <Text type="secondary">No image uploaded yet</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UploadPage;
