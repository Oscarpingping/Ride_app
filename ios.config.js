// iOS 特定配置
module.exports = {
  // iOS 构建优化
  ios: {
    // 支持 iOS 13+
    deploymentTarget: '13.0',
    
    // 网络安全配置
    networkSecurity: {
      // 允许 HTTP 连接到你的服务器
      allowArbitraryLoads: false,
      exceptionDomains: {
        '3.139.190.107': {
          allowInsecureHTTPLoads: true,
          minimumTLSVersion: '1.0',
          includesSubdomains: true
        }
      }
    },
    
    // 性能优化
    optimization: {
      // 启用 Hermes JavaScript 引擎
      hermes: true,
      // 启用新架构
      newArchEnabled: true
    }
  }
};