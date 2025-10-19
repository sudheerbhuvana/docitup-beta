import axios from 'axios';
import { logger } from './logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request
  logger.api.request(
    config.method?.toUpperCase() || 'GET',
    config.url || '',
    config.data
  );
  
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log successful response
    logger.api.response(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    // Log error
    logger.api.error(
      error.config?.method?.toUpperCase() || 'GET',
      error.config?.url || '',
      error.response?.data || error.message
    );
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; fullName?: string; username?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  verifyOTP: async (data: { email: string; code: string }) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },
  
  resendOTP: async (data: { email: string }) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
  },
  
  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },
  
  resetPassword: async (data: { email: string; code: string; newPassword: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  
  checkUsername: async (username: string) => {
    const response = await api.get(`/auth/check-username/${username}`);
    return response.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (data: { username?: string; fullName?: string; bio?: string; isPublicProfile?: boolean; profileImage?: string; location?: string; website?: string; socialLinks?: { twitter?: string; instagram?: string; linkedin?: string } }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Entries API
export const entriesAPI = {
  getAll: async (params?: { limit?: number; offset?: number; mood?: string; tags?: string[]; privacy?: string; userId?: string }) => {
    const response = await api.get('/entries', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/entries/${id}`);
    return response.data;
  },
  
  create: async (data: { title?: string; content: string; mood?: string; tags?: string[]; media?: string[]; isDraft?: boolean; privacy?: 'private' | 'friends' | 'public'; visibility?: 'private' | 'followers' | 'public'; description?: string }) => {
    const response = await api.post('/entries', data);
    return response.data;
  },
  
  update: async (id: string, data: { title?: string; content?: string; mood?: string; tags?: string[]; media?: string[]; isDraft?: boolean; privacy?: 'private' | 'friends' | 'public'; visibility?: 'private' | 'followers' | 'public'; description?: string }) => {
    const response = await api.put(`/entries/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/entries/${id}`);
    return response.data;
  },
  
  toggleLike: async (id: string) => {
    const response = await api.post(`/entries/${id}/like`);
    return response.data;
  },
  
  getComments: async (id: string) => {
    const response = await api.get(`/entries/${id}/comments`);
    return response.data;
  },
  
  createComment: async (id: string, content: string) => {
    const response = await api.post(`/entries/${id}/comments`, { content });
    return response.data;
  },
  
  deleteComment: async (postId: string, commentId: string) => {
    const response = await api.delete(`/entries/${postId}/comments/${commentId}`);
    return response.data;
  },
};

// Goals API
export const goalsAPI = {
  getAll: async (params?: { status?: string; limit?: number; offset?: number }) => {
    const response = await api.get('/goals', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },
  
  create: async (data: { title: string; description?: string; category?: string; targetDate?: string; isPublic?: boolean; steps?: any[] }) => {
    const response = await api.post('/goals', data);
    return response.data;
  },
  
  update: async (id: string, data: { title?: string; description?: string; category?: string; targetDate?: string; progressPercentage?: number; status?: string; isPublic?: boolean; steps?: any[] }) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
  
  updateStep: async (goalId: string, stepId: string, data: { isCompleted: boolean }) => {
    const response = await api.patch(`/goals/${goalId}/steps/${stepId}`, data);
    return response.data;
  },
};

// Community API
export const communityAPI = {
  getPublicProfiles: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get('/community/profiles', { params });
    return response.data;
  },
  
  getPublicGoals: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get('/community/goals', { params });
    return response.data;
  },
  
  getUserPublicProfile: async (userId: string) => {
    const response = await api.get(`/community/profiles/${userId}`);
    return response.data;
  },
};

// Media API
export const mediaAPI = {
  upload: async (formData: FormData) => {
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (fileKey: string) => {
    const response = await api.delete('/media/delete', {
      data: { fileKey },
    });
    return response.data;
  },
  
  getPresignedUrl: async (key: string) => {
    // Encode the key for URL parameter
    const encodedKey = encodeURIComponent(key);
    const response = await api.get(`/media/presigned-url/${encodedKey}`);
    return response.data;
  },
  
  // Legacy method for getting upload URL (not used in ImageUpload component)
  getUploadUrl: async (filename: string, contentType: string) => {
    const response = await api.post('/media/presigned-url', {
      filename,
      contentType,
    });
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  getMyProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },
  
  updateMyProfile: async (data: {
    username?: string;
    fullName?: string;
    bio?: string;
    profileImage?: string;
    isPublicProfile?: boolean;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  }) => {
    const response = await api.put('/profile/me', data);
    return response.data;
  },
  
  getPublicProfile: async (username: string) => {
    const response = await api.get(`/profile/user/${username}`);
    return response.data;
  },
  
  followUser: async (userId: string) => {
    const response = await api.post(`/profile/follow/${userId}`);
    return response.data;
  },
  
  unfollowUser: async (userId: string) => {
    const response = await api.delete(`/profile/follow/${userId}`);
    return response.data;
  },
  
  sendFriendRequest: async (userId: string) => {
    const response = await api.post(`/profile/friend/${userId}`);
    return response.data;
  },
  
  removeFriend: async (userId: string) => {
    const response = await api.delete(`/profile/friend/${userId}`);
    return response.data;
  },
  
  getFriends: async () => {
    const response = await api.get('/profile/me/friends');
    return response.data;
  },
  
  getFollowers: async () => {
    const response = await api.get('/profile/me/followers');
    return response.data;
  },
  
  getFollowing: async () => {
    const response = await api.get('/profile/me/following');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (params?: { date?: string; start?: string; end?: string }) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  create: async (data: { title: string; description?: string; date: string; startTime: string; endTime: string; color?: string }) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  
  update: async (id: string, data: { title?: string; description?: string; date?: string; startTime?: string; endTime?: string; color?: string; completed?: boolean }) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  
  toggleComplete: async (id: string) => {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data;
  },
};

// Feed API
export const feedAPI = {
  getFeed: async (params?: { userId?: string; tag?: string; mood?: string; limit?: number; offset?: number }) => {
    const response = await api.get('/community/feed', { params });
    return response.data;
  },
};
