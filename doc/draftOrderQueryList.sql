SELECT COUNT(*) AS cnt FROM DraftOrderSnapshot;
SELECT id, mode, strategy, seasonYear, seasonType, throughWeek, computedAt
FROM DraftOrderSnapshot
ORDER BY computedAt DESC
LIMIT 5;