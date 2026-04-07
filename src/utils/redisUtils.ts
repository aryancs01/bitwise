import { redisClient } from "../config/redis.config";
import { sendWebSocketMessage } from "../config/socket";
const LARGE_NUMBER = 1000000000;

export const createRedisSortedSet = async (
  contestId: string,
  userId: string,
  solvedCount: number,
  totalTime: number,
) => {
  const key = `contest:${contestId}:leaderboard`;
  const score = solvedCount * LARGE_NUMBER - totalTime;

  await redisClient.zadd(key, score, userId)
  const rank = await redisClient.zrevrank(key, userId);  

  // send all leaderboard data to clients whenever there's an update
  const leaderboard = await redisClient.zrevrange(key, 0, -1, "WITHSCORES");

  const formattedLeaderboard = [];
  for (let i = 0; i < leaderboard.length; i += 2) {
    formattedLeaderboard.push({
      userId: leaderboard[i],
      score: parseInt(leaderboard[i + 1] ?? "0", 10),
      rank: i / 2 + 1,
    });
  }

  sendWebSocketMessage({
    type: "leaderboard_update",
    contestId,
    leaderboard: formattedLeaderboard,
  });

  return {
    score,
    rank: rank !== null ? rank + 1 : null,
  };
};
