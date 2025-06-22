//import { api } from './api';
import { 
  Club, 
  CreateClubRequest, 
  UpdateClubRequest, 
  ClubResponse, 
  ClubListResponse, 
  ClubMemberResponse, 
  ClubAdminResponse,
  JoinClubRequest
} from '../types/club';
import { request } from '../../app/services/api';
import { API_ENDPOINTS } from '../config/api';

export const clubApi = {
  // 创建俱乐部
  createClub: async (data: CreateClubRequest): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(API_ENDPOINTS.CLUBS.CREATE, 'POST', data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create club');
    }
  },

  // 获取俱乐部列表
  getClubs: async (params?: {
    type?: string;
    city?: string;
    search?: string;
  }): Promise<ClubListResponse> => {
    try {
      const response = await request<ClubListResponse>(API_ENDPOINTS.CLUBS.BASE, 'GET', params);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get clubs');
    }
  },

  // 获取俱乐部详情
  getClub: async (id: string): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get club');
    }
  },

  // 更新俱乐部
  updateClub: async (id: string, formData: FormData): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}`, 'PUT', formData);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update club');
    }
  },

  // 删除俱乐部
  deleteClub: async (id: string): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}`, 'DELETE');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete club');
    }
  },

  // 申请加入俱乐部
  requestJoinClub: async (id: string, data: JoinClubRequest): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}/join-requests`, 'POST', data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to request join club');
    }
  },

  // 处理加入申请
  handleJoinRequest: async (
    id: string,
    requestId: string,
    action: 'approve' | 'reject',
    responseMessage?: string
  ): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(
        `${API_ENDPOINTS.CLUBS.BASE}/${id}/join-requests/${requestId}`,
        'POST',
        { action, response: responseMessage }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to handle join request');
    }
  },

  // 获取俱乐部成员
  getClubMembers: async (id: string): Promise<ClubMemberResponse> => {
    try {
      const response = await request<ClubMemberResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}/members`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get club members');
    }
  },

  // 添加成员
  addMember: async (id: string, userId: string): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}/members/add`, 'POST', { userId });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add member');
    }
  },

  // 移除成员
  removeMember: async (id: string, userId: string): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}/members/remove`, 'POST', { userId });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove member');
    }
  },

  // 添加管理员
  addAdmin: async (id: string, userId: string): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}/admins/add`, 'POST', { userId });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add admin');
    }
  },

  // 移除管理员
  removeAdmin: async (id: string, userId: string): Promise<ClubResponse> => {
    try {
      const response = await request<ClubResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}/admins/remove`, 'POST', { userId });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove admin');
    }
  },

  // 获取俱乐部管理员
  getClubAdmins: async (id: string): Promise<ClubAdminResponse> => {
    try {
      const response = await request<ClubAdminResponse>(`${API_ENDPOINTS.CLUBS.BASE}/${id}/admins`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get club admins');
    }
  },

  // 获取用户已加入的俱乐部
  getUserClubs: async (): Promise<ClubListResponse> => {
    try {
      const response = await request<ClubListResponse>(`${API_ENDPOINTS.CLUBS.BASE}/user`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user clubs');
    }
  }
}; 