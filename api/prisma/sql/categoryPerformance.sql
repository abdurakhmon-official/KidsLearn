SELECT c.id,
       c.name,
       c.icon,
       c.color,
       SUM(gs."correctCount")::int AS correct,
       SUM(gs."totalItems")::int   AS total,
       COUNT(*)::int               AS sessions
FROM game_sessions gs
       JOIN games g ON g.id = gs."gameId"
       JOIN categories c ON c.id = g."categoryId"
WHERE gs."childId" = $1
  AND gs."createdAt" >= $2
GROUP BY c.id, c.name, c.icon, c.color
