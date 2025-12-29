// JWT utility functions
export const decodeJWT = (token: string): { sub?: string; exp?: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  // Check if token expires in less than 1 minute
  return decoded.exp * 1000 < Date.now() + 60000;
};

