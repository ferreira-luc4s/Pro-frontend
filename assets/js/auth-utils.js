class AuthUtils {
  static checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return false;
    }
    return token;
  }

  static logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }

  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return headers;
  }
}