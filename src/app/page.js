'use client';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import {
  FileTextOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  YoutubeFilled,
  ArrowRightOutlined
} from '@ant-design/icons';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  const tools = [
    {
      icon: <FileTextOutlined />,
      title: 'Text Analysis',
      description: 'Advanced text analysis using AI to extract insights, summarize content, and identify key information from any text.',
      route: '/text',
      features: ['Text Summarization', 'Sentiment Analysis', 'Keyword Extraction']
    },
    {
      icon: <FileWordOutlined />,
      title: 'Word Processing',
      description: 'Process and analyze Word documents with AI. Extract data, convert formats, and generate summaries automatically.',
      route: '/word',
      features: ['Document Analysis', 'Format Conversion', 'Content Extraction']
    },
    // {
    //   icon: <FilePdfOutlined />,
    //   title: 'PDF Tools',
    //   description: 'Powerful PDF processing tools powered by AI. Extract text, analyze content, and convert PDFs with ease.',
    //   route: '/pdf',
    //   features: ['PDF Text Extraction', 'Document Analysis', 'Format Conversion']
    // },
    {
      icon: <YoutubeFilled />,
      title: 'YouTube Tools',
      description: 'AI-powered YouTube video analysis. Generate transcripts, summaries, and insights from any YouTube video.',
      route: '/youtube',
      features: ['Video Transcription', 'Content Summary', 'Key Points Extraction']
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>AI-Powered Content Processing Tools</h1>
        <p className={styles.heroSubtitle}>
          Transform your content processing workflow with our suite of AI-powered tools.
          Analyze text, process documents, and extract insights with state-of-the-art artificial intelligence.
        </p>
        <Button type="primary" size="large" onClick={() => router.push('/text')}>
          Get Started <ArrowRightOutlined />
        </Button>
      </section>

      {/* Tools Grid */}
      <section className={styles.cardGrid}>
        {tools.map((tool, index) => (
          <div
            key={index}
            className={styles.card}
            onClick={() => router.push(tool.route)}
          >
            <div className={styles.cardIcon}>{tool.icon}</div>
            <h3 className={styles.cardTitle}>{tool.title}</h3>
            <p className={styles.cardDescription}>{tool.description}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tool.features.map((feature, idx) => (
                <li key={idx} style={{ color: '#666', marginBottom: '8px' }}>
                  • {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Why Choose Our AI Tools?</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Advanced AI Technology</h3>
            <p className={styles.cardDescription}>
              Powered by state-of-the-art artificial intelligence models for accurate and reliable results.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Easy to Use</h3>
            <p className={styles.cardDescription}>
              Simple and intuitive interface designed for users of all technical backgrounds.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Fast Processing</h3>
            <p className={styles.cardDescription}>
              Quick and efficient processing of your content with real-time results.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
