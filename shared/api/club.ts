import type { Club } from '../types/club';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ClubApi {
  private static baseUrl = '/api/clubs';

  static async getClubs(): Promise<ApiResponse<Club[]>> {
    try {
      const response = await fetch(this.baseUrl);
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch clubs',
      };
    }
  }

  static async getClub(id: string): Promise<ApiResponse<Club>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch club',
      };
    }
  }

  static async createClub(club: {
    name: string;
    description: string;
    contactEmail: string;
  }): Promise<ApiResponse<Club>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(club),
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create club',
      };
    }
  }

  static async updateClub(id: string, club: Partial<Club>): Promise<ApiResponse<Club>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(club),
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update club',
      };
    }
  }

  static async deleteClub(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return {
        success: response.ok,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete club',
      };
    }
  }

  static async joinClub(id: string, message?: string): Promise<ApiResponse<Club>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to join club',
      };
    }
  }

  static async leaveClub(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/leave`, {
        method: 'POST',
      });
      const data = await response.json();
      return {
        success: response.ok,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to leave club',
      };
    }
  }

  static async handleJoinRequest(
    clubId: string,
    userId: string,
    status: 'approved' | 'rejected',
    response?: string
  ): Promise<ApiResponse<Club>> {
    try {
      const apiResponse = await fetch(`${this.baseUrl}/${clubId}/join-requests/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, response }),
      });
      const data = await apiResponse.json();
      return {
        success: apiResponse.ok,
        data: apiResponse.ok ? data : undefined,
        error: !apiResponse.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to handle join request',
      };
    }
  }

  static async searchClubs(query: string): Promise<ApiResponse<Club[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search clubs',
      };
    }
  }

  static async filterClubsByType(type: string): Promise<ApiResponse<Club[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/filter?type=${encodeURIComponent(type)}`);
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to filter clubs',
      };
    }
  }

  static async filterClubsByLocation(location: {
    city?: string;
    province?: string;
    country?: string;
  }): Promise<ApiResponse<Club[]>> {
    try {
      const params = new URLSearchParams();
      if (location.city) params.append('city', location.city);
      if (location.province) params.append('province', location.province);
      if (location.country) params.append('country', location.country);

      const response = await fetch(`${this.baseUrl}/filter?${params.toString()}`);
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to filter clubs',
      };
    }
  }
} 