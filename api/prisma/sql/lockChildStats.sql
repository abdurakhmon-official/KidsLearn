SELECT "childId"
FROM child_stats
WHERE "childId" = $1
FOR UPDATE
