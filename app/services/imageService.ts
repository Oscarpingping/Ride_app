import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { User } from '../../shared/types/user-unified';
import { Club } from '../../shared/types/club';
import { Platform } from 'react-native';
import { getAuthToken } from './api';

export type ImageType = 'avatar' | 'club-logo' | 'club-cover';
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'gif';

interface PickImageOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
}

interface UploadImageOptions {
  type: ImageType;
  _id?: string;
  format?: ImageFormat;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ImageService {
  private static readonly SUPPORTED_FORMATS: ImageFormat[] = (process.env.EXPO_PUBLIC_SUPPORTED_IMAGE_FORMATS || 'jpg,jpeg,png,gif').split(',') as ImageFormat[];
  private static readonly MAX_FILE_SIZE = parseInt(process.env.EXPO_PUBLIC_MAX_IMAGE_SIZE || '5242880'); // 5MB default
  private static readonly baseUrl = process.env.EXPO_PUBLIC_NGINX_URL;
  private static readonly API_URL = process.env.EXPO_PUBLIC_API_URL;

  static getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}${path}`;
  }

  static async pickImage(options: {
    aspect?: [number, number];
    quality?: number;
    allowsEditing?: boolean;
  } = {}) {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect,
        quality: options.quality ?? 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  private static async validateImage(uri: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        return { isValid: false, error: 'Image file does not exist' };
      }

      if (fileInfo.size && fileInfo.size > this.MAX_FILE_SIZE) {
        return { isValid: false, error: 'Image size exceeds 5MB limit' };
      }

      // 获取文件扩展名
      const extension = uri.split('.').pop()?.toLowerCase();
      if (!extension || !this.SUPPORTED_FORMATS.includes(extension as ImageFormat)) {
        return { isValid: false, error: 'Unsupported image format' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Failed to validate image' };
    }
  }

  static async compressImage(uri: string, format: ImageFormat = 'jpeg'): Promise<string> {
    const validation = await this.validateImage(uri);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);

    // expo-image-manipulator 不支持 GIF，直接返回原图
    if (format === 'gif') {
      return uri;
    }

    if (fileInfo.exists && fileInfo.size && fileInfo.size > 2 * 1024 * 1024) {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }],
        {
          compress: 0.7,
          format: format === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG
        }
      );
      return manipResult.uri;
    }

    return uri;
  }

  private static async uploadImageCore(uri: string, options: {
    url: string;
    fieldName: string;
    method?: string;
    extraFormData?: Record<string, string>;
  }) {
    console.log('[uploadImageCore] called with uri:', uri, 'options:', options);
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append(options.fieldName, {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type: fileType,
    } as any);

    if (options.extraFormData) {
      Object.entries(options.extraFormData).forEach(([k, v]) => formData.append(k, v));
    }

    // 调试：打印即将发送的请求信息
    console.log('[uploadImageCore] fetch about to send:', {
      url: options.url,
      method: options.method || 'POST',
      fieldName: options.fieldName,
      filename,
      fileType,
      formDataKeys: Array.from((formData as any)._parts || []),
    });

    // 获取 token 并加到 headers
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(options.url, {
      method: options.method || 'POST',
      body: formData,
      headers, // 只加 Authorization，不加 Content-Type
    });

    // 调试：打印 fetch 响应状态
    console.log('[uploadImageCore] fetch response status:', response.status);
    let result;
    try {
      result = await response.json();
      console.log('[uploadImageCore] fetch response json:', result);
    } catch (e) {
      console.log('[uploadImageCore] fetch response not json');
      result = null;
    }

    if (!response.ok) throw new Error('Upload failed');
    if (result && result.success && (result.url || result.data)) {
      return result.url || result.data.avatar || result.data.logo || result.data.coverImage;
    } else {
      throw new Error((result && result.error) || 'Upload failed');
    }
  }

  static async uploadAvatar(uri: string) {
    const result = await this.uploadImageCore(uri, {
      url: `${this.API_URL}/api/users/avatar`,
      fieldName: 'avatar'
    });
    return result;
  }

  static async uploadClubLogo(uri: string, _id: string) {
    return this.uploadImageCore(uri, {
      url: `${this.API_URL}/api/clubs/${_id}`,
      fieldName: 'logo',
      method: 'PUT',
    });
  }

  static async uploadClubCover(uri: string, _id: string) {
    return this.uploadImageCore(uri, {
      url: `${this.API_URL}/api/clubs/${_id}`,
      fieldName: 'coverImage',
      method: 'PUT',
    });
  }

  // 新增：专门的头像上传方法，返回完整响应
  static async uploadAvatarWithUserData(uri: string) {
    console.log('[uploadAvatarWithUserData] called with uri:', uri);
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type: fileType,
    } as any);

    // 获取 token 并加到 headers
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.API_URL}/api/users/avatar`, {
      method: 'POST',
      body: formData,
      headers,
    });

    console.log('[uploadAvatarWithUserData] fetch response status:', response.status);
    let result;
    try {
      result = await response.json();
      console.log('[uploadAvatarWithUserData] fetch response json:', result);
    } catch (e) {
      console.log('[uploadAvatarWithUserData] fetch response not json');
      result = null;
    }

    if (!response.ok) throw new Error('Upload failed');
    if (result && result.success) {
      return result;
    } else {
      throw new Error((result && result.error) || 'Upload failed');
    }
  }
} 