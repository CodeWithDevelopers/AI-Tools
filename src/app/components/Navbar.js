'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuOutlined, CloseOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu } from 'antd';
import { useUser } from '../context/UserContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useUser();

  const navLinks = [
    { href: '/text', label: 'Text' },
    { href: '/word', label: 'Word' },
    { href: '/youtube', label: 'YouTube' },
    { href: '/docs', label: 'Documentation' },
  ];

  const profileMenuItems = [
    {
      key: 'profile',
      label: <Link href="/profile">Profile</Link>,
      icon: <UserOutlined />
    },
    {
      key: 'logout',
      label: <span onClick={logout}>Logout</span>,
      icon: <LogoutOutlined />
    }
  ];

  const mobileMenuItems = [
    ...navLinks.map(link => ({
      key: link.href,
      label: <Link href={link.href}>{link.label}</Link>
    })),
    ...(user ? profileMenuItems : [{
      key: 'getStarted',
      label: <Link href="/signup">Get Started</Link>
    }])
  ];

  const isActive = (path) => pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `/api/profile/avatar/${user.id}?${new Date().getTime()}`;
    }
    return null;
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          AI Tools
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${isActive(link.href) ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <Dropdown
              menu={{ items: profileMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className={styles.profileAvatar}>
                <Avatar 
                  size="medium"
                  src={getAvatarUrl()}
                  icon={!user.avatar && <UserOutlined />}
                >
                  {!user.avatar && user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </div>
            </Dropdown>
          ) : (
            <Link href="/signup" className={styles.getStartedButton}>
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={styles.mobileNav}>
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
          
          <div className={`${styles.mobileMenu} ${isOpen ? styles.isOpen : ''}`}>
            <Menu
              mode="vertical"
              selectedKeys={[pathname]}
              items={mobileMenuItems}
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
