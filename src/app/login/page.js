'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Input, Button, Checkbox, Form } from 'antd';
import { 
  MailOutlined, 
  LockOutlined,
  GoogleOutlined,
  GithubOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import styles from '../styles/auth.module.css';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    // Handle login logic here
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.animationContainer}>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>
        <div className={styles.welcomeText}>
          <h1 className={styles.welcomeTitle}>Welcome to AI Tools</h1>
          <p className={styles.welcomeDescription}>
            Access powerful AI tools to enhance your productivity and creativity
          </p>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <ThunderboltOutlined />
            </span>
            <span>Fast and efficient processing</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <SafetyOutlined />
            </span>
            <span>Secure and private analysis</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <CheckCircleOutlined />
            </span>
            <span>Multiple AI tools in one place</span>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Log in to continue using AI tools</p>
          </div>

          <div className={styles.socialButtons}>
            <div className={`${styles.socialButton} ${styles.google}`}>
              <GoogleOutlined />
              Google
            </div>
            <div className={`${styles.socialButton} ${styles.github}`}>
              <GithubOutlined />
              GitHub
            </div>
          </div>

          <div className={styles.divider}>or login with email</div>

          <Form
            name="login"
            onFinish={onFinish}
            className={styles.form}
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Email" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Link href="/forgot-password" className={styles.switchLink} style={{ float: 'right' }}>
                Forgot password?
              </Link>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Log in
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.switchText}>
            Don't have an account?
            <Link href="/signup" className={styles.switchLink}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
