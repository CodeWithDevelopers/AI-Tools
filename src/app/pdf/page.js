'use client';
import { useState } from 'react';
import { 
    Upload, Button, Card, List, Tabs, message, Typography, Spin, Input, Empty, Progress, Tag, Space, Divider 
} from 'antd';
import { 
    InboxOutlined, FileTextOutlined, BulbOutlined, 
    QuestionCircleOutlined, LoadingOutlined, BookOutlined,
    TagOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function PDFPage() {
    const [summary, setSummary] = useState('');
    const [bulletPoints, setBulletPoints] = useState([]);
    const [topics, setTopics] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileList, setFileList] = useState([]);
    const [error, setError] = useState('');
    const [fileKey, setFileKey] = useState('');
    const [activeTab, setActiveTab] = useState('1');

    const uploadProps = {
        name: 'file',
        multiple: false,
        accept: '.pdf',
        maxCount: 1,
        fileList,
        showUploadList: true,
        beforeUpload: (file) => {
            const isPDF = file.type === 'application/pdf';
            if (!isPDF) {
                message.error('You can only upload PDF files!');
                return false;
            }
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('File must be smaller than 10MB!');
                return false;
            }
            return true;
        },
        customRequest: async ({ file, onSuccess, onError, onProgress }) => {
            try {
                setUploading(true);
                setError('');
                setUploadProgress(0);
                
                // Reset states
                setSummary('');
                setBulletPoints([]);
                setTopics([]);
                setMetadata(null);
                setStatistics(null);

                const formData = new FormData();
                formData.append('file', file);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/pdf', true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percent);
                        onProgress({ percent });
                    }
                };

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        setSummary(response.summary);
                        setBulletPoints(response.bulletPoints || []);
                        setTopics(response.topics || []);
                        setMetadata(response.metadata);
                        setStatistics(response.statistics);
                        setFileKey(response.fileHash);
                        setFileList([{ ...file, status: 'done' }]);
                        
                        if (response.fromCache) {
                            message.success('PDF loaded from cache!');
                        } else {
                            message.success('PDF processed successfully!');
                        }
                        
                        onSuccess();
                    } else {
                        const error = JSON.parse(xhr.responseText);
                        throw new Error(error.error || 'Upload failed');
                    }
                };

                xhr.onerror = () => {
                    const error = new Error('Network error');
                    setError(error.message);
                    onError(error);
                };

                xhr.send(formData);
            } catch (error) {
                setError(error.message);
                setFileList([{ ...file, status: 'error' }]);
                message.error(error.message);
                onError(error);
            } finally {
                setUploading(false);
                setUploadProgress(0);
            }
        },
        onRemove: () => {
            setFileList([]);
            setSummary('');
            setBulletPoints([]);
            setTopics([]);
            setMetadata(null);
            setStatistics(null);
            setFileKey('');
            setError('');
        }
    };

    const items = [
        {
            key: '1',
            label: 'Summary',
            icon: <FileTextOutlined />,
            children: (
                <Card>
                    {summary ? (
                        <Paragraph>{summary}</Paragraph>
                    ) : (
                        <Empty description="Upload a PDF to see its summary" />
                    )}
                </Card>
            )
        },
        {
            key: '2',
            label: 'Key Points',
            icon: <BulbOutlined />,
            children: (
                <Card>
                    {bulletPoints && bulletPoints.length > 0 ? (
                        <List
                            dataSource={bulletPoints}
                            renderItem={(point) => (
                                <List.Item>
                                    <Text>• {point}</Text>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="Upload a PDF to see key points" />
                    )}
                </Card>
            )
        },
        {
            key: '3',
            label: 'Topics',
            icon: <TagOutlined />,
            children: (
                <Card>
                    {topics && topics.length > 0 ? (
                        <Space wrap>
                            {topics.map((topic, index) => (
                                <Tag key={index} color="blue">{topic}</Tag>
                            ))}
                        </Space>
                    ) : (
                        <Empty description="Upload a PDF to see topics" />
                    )}
                </Card>
            )
        },
        {
            key: '4',
            label: 'Document Info',
            icon: <InfoCircleOutlined />,
            children: (
                <Card>
                    {metadata ? (
                        <>
                            <Paragraph>
                                <Text strong>Title:</Text> {metadata.title}<br />
                                <Text strong>Author:</Text> {metadata.author}<br />
                                <Text strong>Pages:</Text> {metadata.pageCount}<br />
                                <Text strong>File Size:</Text> {metadata.fileSize}<br />
                                {metadata.keywords && (
                                    <><Text strong>Keywords:</Text> {metadata.keywords}<br /></>
                                )}
                                {metadata.producer && (
                                    <><Text strong>Producer:</Text> {metadata.producer}<br /></>
                                )}
                            </Paragraph>
                            {statistics && (
                                <>
                                    <Divider />
                                    <Title level={5}>Statistics</Title>
                                    <Paragraph>
                                        <Text strong>Word Count:</Text> {statistics.wordCount}<br />
                                        <Text strong>Character Count:</Text> {statistics.characterCount}<br />
                                        <Text strong>Sentence Count:</Text> {statistics.sentenceCount}
                                    </Paragraph>
                                </>
                            )}
                        </>
                    ) : (
                        <Empty description="Upload a PDF to see document information" />
                    )}
                </Card>
            )
        }
    ];

    const handleQuery = async () => {
        if (!query.trim()) {
            message.warning('Please enter a query');
            return;
        }

        if (!fileKey) {
            message.warning('Please upload a PDF first');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await fetch('/api/pdf', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, fileKey }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to process query');
            }

            const data = await response.json();
            setAnswer(data.response);
        } catch (error) {
            setError(error.message);
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <Title level={2}>PDF Analyzer</Title>
            
            <Card className="mb-6">
                <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                        Click or drag PDF file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                        Support for single PDF file up to 10MB
                    </p>
                </Dragger>
                
                {uploading && (
                    <div className="mt-4">
                        <Progress percent={uploadProgress} status="active" />
                    </div>
                )}
                
                {error && (
                    <div className="mt-4">
                        <Text type="danger">{error}</Text>
                    </div>
                )}
            </Card>

            {(summary || bulletPoints.length > 0 || topics.length > 0 || metadata) && (
                <Card>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={items}
                    />
                </Card>
            )}
            
            <Card>
                <TextArea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about the PDF..."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    style={{ marginBottom: '16px' }}
                    disabled={loading || !fileKey}
                />
                <Button
                    type="primary"
                    onClick={handleQuery}
                    loading={loading}
                    disabled={!fileKey}
                    block
                >
                    Ask Question
                </Button>

                {answer && (
                    <>
                        <Divider>Answer</Divider>
                        <Paragraph>{answer}</Paragraph>
                    </>
                )}
            </Card>
        </div>
    );
}
