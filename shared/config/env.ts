interface EnvConfig {
  API_BASE_URL: string;
  MAPBOX_ACCESS_TOKEN: string;
  GOOGLE_MAPS_API_KEY: string;
  MAX_FILE_SIZE: number;
  SUPPORTED_IMAGE_TYPES: string[];
  DEFAULT_LANGUAGE: string;
  SUPPORTED_LANGUAGES: string[];
}
import { ENV_CONFIG } from './environment';

const env: EnvConfig = {
  API_BASE_URL: ENV_CONFIG.API_BASE_URL,
  MAPBOX_ACCESS_TOKEN: ENV_CONFIG.MAPBOX_ACCESS_TOKEN,
  GOOGLE_MAPS_API_KEY: ENV_CONFIG.GOOGLE_MAPS_API_KEY,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  DEFAULT_LANGUAGE: 'zh-CN',
  SUPPORTED_LANGUAGES: ['zh-CN', 'en-US'],
};

export default env;
