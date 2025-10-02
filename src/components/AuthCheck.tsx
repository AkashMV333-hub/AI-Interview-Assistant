import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'interviewee' | 'interviewer';
  iat: number;
  exp: number;
}

const AuthCheck = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Only run if not already authenticated
    if (!isAuthenticated) {
      const token = Cookies.get('auth_token');

      if (token) {
        try {
          const decoded = jwtDecode<JWTPayload>(token);

          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            // Restore auth state from token
            dispatch(login({
              role: decoded.role,
              email: decoded.email,
              name: '', // We'll fetch this from backend if needed
            }));
          } else {
            // Token expired, remove it
            Cookies.remove('auth_token');
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          Cookies.remove('auth_token');
        }
      }
    }
  }, [isAuthenticated, dispatch]);

  return null; // This component doesn't render anything
};

export default AuthCheck;
