import { createClient } from 'redis';
import { config } from './config';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (!config.redis.url) {
    console.warn('REDIS_URL not set, Redis functionality will be disabled');
    return null;
  }

  redisClient = createClient({
    url: config.redis.url,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  await redisClient.connect();
  return redisClient;
}

export async function closeRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Helper functions for queue management
export async function addToQueue(userId: string, mmr: number, region: string) {
  const client = await getRedisClient();
  if (!client) return;

  await client.zAdd('queue:waiting', {
    score: mmr,
    value: userId,
  });

  await client.hSet(`queue:user:${userId}`, {
    mmr: mmr.toString(),
    region,
    joinedAt: Date.now().toString(),
  });
}

export async function removeFromQueue(userId: string) {
  const client = await getRedisClient();
  if (!client) return;

  await client.zRem('queue:waiting', userId);
  await client.del(`queue:user:${userId}`);
}

export async function getQueuePlayers(mmrRange: [number, number], limit: number = 10) {
  const client = await getRedisClient();
  if (!client) return [];

  const players = await client.zRangeByScoreWithScores(
    'queue:waiting',
    mmrRange[0],
    mmrRange[1],
    {
      LIMIT: {
        offset: 0,
        count: limit,
      },
    }
  );

  return players.map(p => ({
    userId: p.value,
    mmr: p.score,
  }));
}

