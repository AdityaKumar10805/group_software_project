import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ===== Students =====
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  verify: (studentId) => api.get(`/students/verify/${studentId}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getClasses: () => api.get('/students/classes/list'),
};

// ===== Attendance =====
export const attendanceAPI = {
  scan: (data) => api.post('/attendance/scan', data),
  manual: (data) => api.post('/attendance/manual', data),
  getAll: (params) => api.get('/attendance', { params }),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  todaySummary: () => api.get('/attendance/today/summary'),
};

// ===== Timetable =====
export const timetableAPI = {
  getAll: (params) => api.get('/timetable', { params }),
  getCurrent: () => api.get('/timetable/current'),
  getMy: () => api.get('/timetable/teacher/my'),
  getTeachers: () => api.get('/timetable/teachers'),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
};

// ===== Reports =====
export const reportAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  subject: (params) => api.get('/reports/subject', { params }),
  student: (params) => api.get('/reports/student', { params }),
  daily: (params) => api.get('/reports/daily', { params }),
};

export default api;
