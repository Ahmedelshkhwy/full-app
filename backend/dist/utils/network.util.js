"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logNetworkInfo = exports.getServerURL = exports.getLocalIP = void 0;
const os_1 = __importDefault(require("os"));
const getLocalIP = () => {
    const interfaces = os_1.default.networkInterfaces();
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
exports.getLocalIP = getLocalIP;
const getServerURL = (port = 5000) => {
    const ip = (0, exports.getLocalIP)();
    return `http://${ip}:${port}`;
};
exports.getServerURL = getServerURL;
const logNetworkInfo = (port = 5000) => {
    const ip = (0, exports.getLocalIP)();
    console.log('\n🌐 Network Information:');
    console.log(`📱 Mobile App URL: http://${ip}:${port}/api`);
    console.log(`💻 Admin Panel URL: http://${ip}:3000`);
    console.log(`🔧 Backend URL: http://${ip}:${port}`);
    console.log(`📚 API Docs: http://${ip}:${port}/api-docs`);
    console.log('');
};
exports.logNetworkInfo = logNetworkInfo;
//# sourceMappingURL=network.util.js.map