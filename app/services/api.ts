// 添加请求日志函数
const logRequest = (method: string, url: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 📤 发送请求:
    Method: ${method}
    URL: ${url}
    ${data ? `Data: ${JSON.stringify(data, null, 2)}` : ''}
  `);
};

// 修改 request 函数
const request = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 记录请求日志
  logRequest(method, url, data);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    // 记录响应日志
    console.log(`[${new Date().toISOString()}] 📥 收到响应:
      Status: ${response.status}
      URL: ${url}
    `);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ 请求失败:
      URL: ${url}
      Error: ${error.message}
    `);
    throw error;
  }
}; 