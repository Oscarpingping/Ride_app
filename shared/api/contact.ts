import { Contact } from '../types/contact';
import { User } from '../types/user';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AddContactRequest {
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const ContactApi = {
  addContact: async (data: AddContactRequest): Promise<ApiResponse<Contact>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        error: error instanceof Error ? error.message : 'Failed to add contact'
      };
    }
  },

  getContacts: async (): Promise<ApiResponse<User[]>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
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
        error: error instanceof Error ? error.message : 'Failed to fetch contacts'
      };
    }
  },

  removeContact: async (contactId: string): Promise<ApiResponse<void>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: response.ok,
        error: !response.ok ? 'Failed to remove contact' : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove contact'
      };
    }
  }
}; 