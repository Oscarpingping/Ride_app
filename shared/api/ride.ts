import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from './types';
import { buildApiUrl, API_ENDPOINTS, HTTP_CONFIG } from '../config/api';

export interface CreateRideRequest {
  title: string;
  description: string;
  difficulty: string;
  terrain: string;
  pace: {
    min: number;
    max: number;
    unit: string;
  };
  maxParticipants: number;
  meetingPoint: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  dateTime: string;
  isRecurring: boolean;
}

export interface Ride {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  terrain: string;
  pace: {
    min: number;
    max: number;
    unit: string;
  };
  maxParticipants: number;
  meetingPoint: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  dateTime: string;
  isRecurring: boolean;
  createdBy: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

// 通用请求函数，包含错误处理和重试机制
const apiRequest = async (
  url: string, 
  options: RequestInit = {},
  retryCount = 0
): Promise<any> => {
  try {
    // console.log(`🚀 API Request [${options.method || 'GET'}] ${url}:`, {
    //   headers: options.headers,
    //   body: options.body ? JSON.parse(options.body as string) : undefined,
    //   retryCount
    // });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseData = await response.json();
    
    // console.log(`✅ API Response [${response.status}] ${url}:`, responseData);
    
    return responseData;
  } catch (error: unknown) {
    // console.error(`❌ API Error [${options.method || 'GET'}] ${url}:`, {
    //   error: error instanceof Error ? error.message : 'Unknown error',
    //   type: error instanceof Error ? error.name : typeof error,
    //   retryCount
    // });
    
    // 如果是网络错误且还有重试次数，则重试
    if (retryCount < HTTP_CONFIG.RETRY_ATTEMPTS && 
        (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError'))) {
      // console.log(`🔄 Retrying request (${retryCount + 1}/${HTTP_CONFIG.RETRY_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, HTTP_CONFIG.RETRY_DELAY));
      return apiRequest(url, options, retryCount + 1);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

// 获取认证头
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Rides API接口
export interface RideApiInterface {
  // 创建活动
  createRide(data: CreateRideRequest): Promise<ApiResponse<Ride>>;
  
  // 获取活动列表
  getRides(): Promise<ApiResponse<Ride[]>>;
  
  // 获取活动详情
  getRide(id: string): Promise<ApiResponse<Ride>>;
  
  // 加入活动
  joinRide(id: string): Promise<ApiResponse<null>>;
  
  // 离开活动
  leaveRide(id: string): Promise<ApiResponse<null>>;
}

// Rides API实现
export const RideApi: RideApiInterface = {
  // 创建活动
  async createRide(data: CreateRideRequest): Promise<ApiResponse<Ride>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.RIDES.CREATE), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // 获取活动列表
  async getRides(): Promise<ApiResponse<Ride[]>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.RIDES.BASE), {
      headers: await getAuthHeaders(),
    });
  },

  // 获取活动详情
  async getRide(id: string): Promise<ApiResponse<Ride>> {
    return apiRequest(buildApiUrl(`${API_ENDPOINTS.RIDES.BASE}/${id}`), {
      headers: await getAuthHeaders(),
    });
  },

  // 加入活动
  async joinRide(id: string): Promise<ApiResponse<null>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.RIDES.JOIN(id)), {
      method: 'POST',
      headers: await getAuthHeaders(),
    });
  },

  // 离开活动
  async leaveRide(id: string): Promise<ApiResponse<null>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.RIDES.LEAVE(id)), {
      method: 'POST',
      headers: await getAuthHeaders(),
    });
  },
};