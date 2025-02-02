'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  GithubOutlined, 
  TwitterOutlined, 
  LinkedinOutlined, 
  FacebookOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import styles from './Footer.module.css';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Don't show the footer on the chatbot route
  if (pathname === '/chatbot') {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* About Section */}
          <div className={styles.section}>
            <h3>About AI Tools</h3>
            <div className={styles.about}>
              <p>
                AI Tools is your comprehensive solution for processing and analyzing various types of content using cutting-edge artificial intelligence technology.
              </p>
              <div className={styles.socialIcons}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <GithubOutlined />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <TwitterOutlined />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <LinkedinOutlined />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <FacebookOutlined />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h3>Quick Links</h3>
            <div className={styles.links}>
              <Link href="/text">Text Analysis</Link>
              <Link href="/word">Word Processing</Link>
              <Link href="/#">PDF Tools</Link>
              <Link href="/youtube">YouTube Tools</Link>
            </div>
          </div>

          {/* Support */}
          <div className={styles.section}>
            <h3>Support</h3>
            <div className={styles.links}>
              <Link href="/help">Help Center</Link>
              <Link href="/docs">Documentation</Link>
              <Link href="#">API Access</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
          </div>

          {/* Contact */}
          <div className={styles.section}>
            <h3>Contact Us</h3>
            <div className={styles.links}>
              <a href="mailto:contact@aitools.com">
                <MailOutlined style={{ marginRight: 8 }} />
                contact@aitools.com
              </a>
              <a href="tel:+1234567890">
                <PhoneOutlined style={{ marginRight: 8 }} />
                +1 (234) 567-890
              </a>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                Silicon Valley, CA
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p> {currentYear} AI Tools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
