-- Totals by preseason flag
SELECT preseason, COUNT(*) AS cnt
FROM Game
WHERE seasonYear = '2025'
GROUP BY preseason;
-- Expect: preseason=1 ~49; preseason=0 =272

-- Totals by week (preseason)
SELECT gameWeek, COUNT(*) AS cnt
FROM Game
WHERE seasonYear = '2025' AND preseason = 1
GROUP BY gameWeek
ORDER BY gameWeek;

-- Totals by week (regular season)
SELECT gameWeek, COUNT(*) AS cnt
FROM Game
WHERE seasonYear = '2025' AND preseason = 0
GROUP BY gameWeek
ORDER BY gameWeek;

-- Status distribution
SELECT gameStatus, COUNT(*) AS cnt
FROM Game
WHERE seasonYear = '2025'
GROUP BY gameStatus;

-- Quick duplicate guard (should be empty because of your unique constraint)
SELECT seasonYear, gameDate, homeTeamId, awayTeamId, COUNT(*) c
FROM Game
WHERE seasonYear = '2025'
GROUP BY seasonYear, gameDate, homeTeamId, awayTeamId
HAVING c > 1;
