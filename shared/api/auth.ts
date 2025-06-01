// AuthApi - 认证相关API的别名，指向UserApi中的认证功能
import { UserApi, LoginRequest, RegisterRequest } from './user';
import { ApiResponse } from './types';

export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// 认证API接口
export interface AuthApiInterface {
  // 登录
  login(data: LoginRequest): Promise<ApiResponse<any>>;
  
  // 注册
  register(data: RegisterRequest): Promise<ApiResponse<any>>;
  
  // 请求密码重置
  requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse<null>>;
  
  // 重置密码
  resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>>;
}

// AuthApi实现 - 直接使用UserApi的方法
export const AuthApi: AuthApiInterface = {
  login: UserApi.login,
  register: UserApi.register,
  requestPasswordReset: UserApi.requestPasswordReset,
  resetPassword: UserApi.resetPassword,
};

// 导出类型
export { LoginRequest, RegisterRequest };