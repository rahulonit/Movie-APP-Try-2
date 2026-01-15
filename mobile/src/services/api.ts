import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              await AsyncStorage.setItem('accessToken', accessToken);
              await AsyncStorage.setItem('refreshToken', newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(email: string, password: string) {
    const response = await this.api.post('/auth/register', { email, password });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    await this.api.post('/auth/logout', { refreshToken });
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Content
  async getHomeFeed() {
    const response = await this.api.get('/home');
    return response.data;
  }

  async getMovieById(id: string) {
    const response = await this.api.get(`/movies/${id}`);
    return response.data;
  }

  async getSeriesById(id: string) {
    const response = await this.api.get(`/series/${id}`);
    return response.data;
  }

  async searchContent(query: string, filters?: any) {
    const response = await this.api.get('/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  }

  async getMoviesByGenre(genre: string, page = 1) {
    const response = await this.api.get(`/movies/genre/${genre}`, {
      params: { page },
    });
    return response.data;
  }

  // Profiles
  async createProfile(name: string, isKids: boolean) {
    const response = await this.api.post('/profiles', { name, isKids });
    return response.data;
  }

  async getProfiles() {
    const response = await this.api.get('/profiles');
    return response.data;
  }

  async updateProfile(profileId: string, data: any) {
    const response = await this.api.put(`/profiles/${profileId}`, data);
    return response.data;
  }

  async deleteProfile(profileId: string) {
    const response = await this.api.delete(`/profiles/${profileId}`);
    return response.data;
  }

  // My List
  async addToMyList(profileId: string, contentId: string) {
    const response = await this.api.post('/my-list/add', { profileId, contentId });
    return response.data;
  }

  async removeFromMyList(profileId: string, contentId: string) {
    const response = await this.api.post('/my-list/remove', { profileId, contentId });
    return response.data;
  }

  async getMyList(profileId: string) {
    const response = await this.api.get(`/my-list/${profileId}`);
    return response.data;
  }

  // Watch Progress
  async updateProgress(data: {
    profileId: string;
    contentId: string;
    contentType: 'Movie' | 'Series';
    episodeId?: string;
    progress: number;
    duration: number;
  }) {
    const response = await this.api.post('/progress/update', data);
    return response.data;
  }

  async getWatchHistory(profileId: string) {
    const response = await this.api.get(`/watch-history/${profileId}`);
    return response.data;
  }
}

export default new ApiService();
