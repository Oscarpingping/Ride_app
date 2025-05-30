import { Club } from '../types/club';

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
  createClub: async (data: CreateClubRequest): Promise<ApiResponse<Club>> => {
    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
      const response = await fetch('/api/clubs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const response = await fetch('/api/clubs/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const response = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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