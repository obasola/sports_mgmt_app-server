select draftYear,round,pickNumber,   
  (select concat(firstName,' ',lastName) from Player where id = playerId) as player,   
  (select name from Team where id = currentTeamId) as team,
  position 
from DraftPick limit 20;

select draftYear,round,pickNumber,   
  (select concat(firstName,' ',lastName) from Player where id = playerId) as player,   
  (select name from Team where id = currentTeamId) as team,
  position 
from DraftPick 
where currentTeamId = 78 
  and draftYear = 2025;