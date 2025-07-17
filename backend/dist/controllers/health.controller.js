"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemInfo = exports.simpleHealthCheck = exports.healthCheck = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_validation_1 = require("../config/env.validation");
const healthCheck = async (_req, res) => {
    const startTime = Date.now();
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env_validation_1.envConfig.NODE_ENV,
        version: '2.0.0',
        checks: {
            database: false,
            memory: false,
            disk: false
        },
        details: {
            database: {
                status: 'unknown'
            },
            memory: {
                used: 0,
                total: 0,
                percentage: 0
            },
            disk: {
                free: 0,
                total: 0,
                percentage: 0
            }
        }
    };
    // Check database connection
    try {
        const dbStartTime = Date.now();
        await mongoose_1.default.connection.db.admin().ping();
        const dbResponseTime = Date.now() - dbStartTime;
        healthStatus.checks.database = true;
        healthStatus.details.database = {
            status: 'connected',
            responseTime: dbResponseTime
        };
    }
    catch (error) {
        healthStatus.status = 'unhealthy';
        healthStatus.checks.database = false;
        healthStatus.details.database = {
            status: 'disconnected'
        };
    }
    // Check memory usage
    try {
        const memUsage = process.memoryUsage();
        const totalMemory = memUsage.heapTotal;
        const usedMemory = memUsage.heapUsed;
        const memoryPercentage = (usedMemory / totalMemory) * 100;
        healthStatus.checks.memory = memoryPercentage < 95; // Consider healthy if < 95%
        healthStatus.details.memory = {
            used: Math.round(usedMemory / 1024 / 1024), // MB
            total: Math.round(totalMemory / 1024 / 1024), // MB
            percentage: Math.round(memoryPercentage)
        };
        if (memoryPercentage > 95) {
            healthStatus.status = 'unhealthy';
        }
    }
    catch (error) {
        healthStatus.status = 'unhealthy';
        healthStatus.checks.memory = false;
    }
    // Check disk space (simplified)
    try {
        // For now, we'll assume disk is healthy
        // In production, you might want to use a library like 'diskusage'
        healthStatus.checks.disk = true;
        healthStatus.details.disk = {
            free: 0, // Would be calculated in production
            total: 0, // Would be calculated in production
            percentage: 0 // Would be calculated in production
        };
    }
    catch (error) {
        healthStatus.status = 'unhealthy';
        healthStatus.checks.disk = false;
    }
    // Determine overall status
    const allChecksPassed = Object.values(healthStatus.checks).every(check => check);
    if (!allChecksPassed) {
        healthStatus.status = 'unhealthy';
    }
    const responseTime = Date.now() - startTime;
    return res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
        ...healthStatus,
        responseTime,
        message: healthStatus.status === 'healthy'
            ? 'النظام يعمل بشكل طبيعي'
            : 'هناك مشاكل في النظام'
    });
};
exports.healthCheck = healthCheck;
// Simple health check for load balancers
const simpleHealthCheck = (_req, res) => {
    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Backend API is running'
    });
};
exports.simpleHealthCheck = simpleHealthCheck;
// Detailed system info (for debugging)
const systemInfo = (_req, res) => {
    const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
        pid: process.pid,
        environment: env_validation_1.envConfig.NODE_ENV,
        port: env_validation_1.envConfig.PORT,
        database: {
            connected: mongoose_1.default.connection.readyState === 1,
            host: mongoose_1.default.connection.host,
            name: mongoose_1.default.connection.name
        }
    };
    return res.status(200).json(systemInfo);
};
exports.systemInfo = systemInfo;
//# sourceMappingURL=health.controller.js.map