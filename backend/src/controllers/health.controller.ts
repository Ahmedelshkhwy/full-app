import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { envConfig } from '../config/env.validation';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: boolean;
    memory: boolean;
    disk: boolean;
  };
  details: {
    database: {
      status: string;
      responseTime?: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      free: number;
      total: number;
      percentage: number;
    };
  };
}

export const healthCheck = async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: envConfig.NODE_ENV,
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
    await mongoose.connection.db.admin().ping();
    const dbResponseTime = Date.now() - dbStartTime;
    
    healthStatus.checks.database = true;
    healthStatus.details.database = {
      status: 'connected',
      responseTime: dbResponseTime
    };
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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

// Simple health check for load balancers
export const simpleHealthCheck = (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Backend API is running'
  });
};

// Detailed system info (for debugging)
export const systemInfo = (_req: Request, res: Response) => {
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    uptime: process.uptime(),
    pid: process.pid,
    environment: envConfig.NODE_ENV,
    port: envConfig.PORT,
    database: {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  };

  return res.status(200).json(systemInfo);
}; 