import os from 'os';

export const getLocalIP = (): string => {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const interface_ of networkInterface) {
        // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
        if (interface_.family === 'IPv4' && !interface_.internal) {
          return interface_.address;
        }
      }
    }
  }
  
  return 'localhost';
};

export const getServerURL = (port: number = 5000): string => {
  const ip = getLocalIP();
  return `http://${ip}:${port}`;
};

export const logNetworkInfo = (port: number = 5000): void => {
  const ip = getLocalIP();
  console.log('\n🌐 Network Information:');
  console.log(`📱 Mobile App URL: http://${ip}:${port}/api`);
  console.log(`💻 Admin Panel URL: http://${ip}:3000`);
  console.log(`🔧 Backend URL: http://${ip}:${port}`);
  console.log(`📚 API Docs: http://${ip}:${port}/api-docs`);
  console.log('');
}; 