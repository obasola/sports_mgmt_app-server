-- Totals by seasonType flag
SELECT seasonType, COUNT(*) AS cnt
FROM Game
WHERE seasonYear = '2025'
GROUP BY seasonType;
-- Expect: seasonType=1 ~49; seasonType=0 =272

-- Totals by week (seasonType)
SELECT gameWeek, COUNT(*) AS cnt
FROM Game
WHERE seasonYear = '2025' AND seasonType = 1
GROUP BY gameWeek
ORDER BY gameWeek;

-- Totals by week (regular season)
SELECT gameWeek, COUNT(*) AS cnt
FROM Game
WHERE seasonYear = '2025' AND seasonType = 0
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
