import Cookies from 'js-cookie';

// Simple JWT-like token generation (for demo purposes)
// In production, use a proper JWT library and server-side token generation
export const generateToken = (userId: string, email: string, role: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId,
      email,
      role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })
  );
  const signature = btoa(`${header}.${payload}.secret`); // Simplified signature
  return `${header}.${payload}.${signature}`;
};

export const verifyToken = (token: string): { userId: string; email: string; role: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
};

export const setTokenCookie = (token: string) => {
  Cookies.set('auth_token', token, { expires: 1 }); // 1 day
};

export const getTokenCookie = (): string | undefined => {
  return Cookies.get('auth_token');
};

export const removeTokenCookie = () => {
  Cookies.remove('auth_token');
};
