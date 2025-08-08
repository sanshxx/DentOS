// Token refresh utility
export const clearStaleToken = () => {
  // Clear all authentication data
  localStorage.removeItem('token');
  sessionStorage.clear();
  
  // Clear axios headers
  if (window.axios) {
    delete window.axios.defaults.headers.common['Authorization'];
  }
  
  // Force page reload to clear any cached state
  window.location.reload();
};

export const checkTokenValidity = (token) => {
  if (!token) return false;
  
  try {
    // Try to decode the token to check its structure
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token has the correct structure (should have 'id' field)
    if (!payload.id) {
      console.warn('Token has invalid structure (missing id field)');
      return false;
    }
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (payload.exp < currentTime) {
      console.warn('Token is expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

export const forceTokenRefresh = () => {
  console.log('Forcing token refresh...');
  clearStaleToken();
};
