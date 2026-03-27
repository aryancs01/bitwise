import Redis from 'ioredis';
import { env } from './env';

const redisConfig = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
}

export const redisClient = new Redis(redisConfig);

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

export const createNewRedisClient = () => {
    return new Redis(redisConfig);
}