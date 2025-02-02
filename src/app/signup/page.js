'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Input, Button, Checkbox, Form } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  RocketOutlined,
  SecurityScanOutlined,
  TeamOutlined
} from '@ant-design/icons';
import styles from '../styles/auth.module.css';

export default function SignUp() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    // Handle signup logic here
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
          <h1 className={styles.welcomeTitle}>Join Our AI Platform</h1>
          <p className={styles.welcomeDescription}>
            Start your journey with our powerful AI tools and transform your workflow
          </p>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <RocketOutlined />
            </span>
            <span>Get started in seconds</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <SecurityScanOutlined />
            </span>
            <span>Advanced security features</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <TeamOutlined />
            </span>
            <span>Join our growing community</span>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Join us to access all AI tools</p>
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

          <div className={styles.divider}>or sign up with email</div>

          <Form
            name="signup"
            onFinish={onFinish}
            className={styles.form}
            initialValues={{ agree: true }}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Full Name" 
                size="large"
              />
            </Form.Item>

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
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions')),
                },
              ]}
            >
              <Checkbox>
                I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
                <Link href="/privacy">Privacy Policy</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.switchText}>
            Already have an account?
            <Link href="/login" className={styles.switchLink}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
