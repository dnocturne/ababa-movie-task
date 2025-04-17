'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { logout, loadUser } from '@/redux/slices/authSlice';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        router.push('/login');
      });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.navLogo}>
          My Movie List
        </Link>

        <div className={styles.navMenu}>
          {isAuthenticated ? (
            <>
              <span className={styles.userName}>Welcome, {user?.username}</span>
              <Link href="/movies" className={styles.navLink}>
                My Movies
              </Link>
              <button onClick={handleLogout} className={styles.navButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/register" className={styles.navLink}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 