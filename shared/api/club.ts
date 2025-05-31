import AsyncStorage from '@react-native-async-storage/async-storage';
import { Club } from '../types/club';
import { API_BASE_URL } from '../config';

export interface CreateClubRequest {
  name: string;
  contactEmail: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const ClubApi = {
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  createClub: async (data: CreateClubRequest): Promise<ApiResponse<Club>> => {
    try {
      const headers = await ClubApi.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result,
        error: !response.ok ? result.message : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create club'
      };
    }
  },

  getClubs: async (): Promise<ApiResponse<Club[]>> => {
    try {
      const headers = await ClubApi.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/clubs`, {
        headers
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result,
        error: !response.ok ? result.message : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch clubs'
      };
    }
  },

  getUserClubs: async (): Promise<ApiResponse<Club[]>> => {
    try {
      const headers = await ClubApi.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/clubs/user`, {
        headers
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result,
        error: !response.ok ? result.message : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user clubs'
      };
    }
  },

  joinClub: async (clubId: string): Promise<ApiResponse<Club>> => {
    try {
      const headers = await ClubApi.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/join`, {
        method: 'POST',
        headers
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result,
        error: !response.ok ? result.message : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join club'
      };
    }
  }
}; 