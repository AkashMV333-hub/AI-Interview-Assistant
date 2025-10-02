import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Cookies from 'js-cookie';
import type { UserRole } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const token = Cookies.get('auth_token');

  // If not authenticated or no token, redirect to role selection
  if (!isAuthenticated || !token) {
    return <Navigate to="/" replace />;
  }

  // If role doesn't match, redirect to correct page
  if (role !== allowedRole) {
    if (role === 'interviewee') {
      return <Navigate to="/join-room" replace />;
    } else if (role === 'interviewer') {
      return <Navigate to="/interviewer/rooms" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
