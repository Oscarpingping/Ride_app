/**
 * @deprecated 请使用 shared/types/user-unified.ts 中的统一类型定义
 * 这个文件保留是为了向后兼容，新代码请使用统一的类型定义
 */

// 重新导出统一的类型定义
export {
  User,
  UserState,
  ClubReference,
  EmergencyContact,
  BaseUser,
  UserSummary,
  UserPublic,
  SocketUser,
  AuthUser,
  UserStatus,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  isUser,
  isUserSummary,
  toUserSummary,
  toUserPublic,
  toSocketUser,
  toAuthUser
} from './user-unified'; 