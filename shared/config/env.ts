interface EnvConfig {
  API_BASE_URL: string;
  MAPBOX_ACCESS_TOKEN: string;
  GOOGLE_MAPS_API_KEY: string;
  MAX_FILE_SIZE: number;
  SUPPORTED_IMAGE_TYPES: string[];
  DEFAULT_LANGUAGE: string;
  SUPPORTED_LANGUAGES: string[];
}

const env: EnvConfig = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5001/api',
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  DEFAULT_LANGUAGE: 'zh-CN',
  SUPPORTED_LANGUAGES: ['zh-CN', 'en-US'],
};

export default env;
