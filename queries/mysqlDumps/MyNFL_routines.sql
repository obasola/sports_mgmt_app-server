-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: MyNFL
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `TeamScheduleView`
--

DROP TABLE IF EXISTS `TeamScheduleView`;
/*!50001 DROP VIEW IF EXISTS `TeamScheduleView`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `TeamScheduleView` AS SELECT 
 1 AS `gameId`,
 1 AS `seasonYear`,
 1 AS `scheduleWeek`,
 1 AS `gameDate`,
 1 AS `gameCity`,
 1 AS `gameStateProvince`,
 1 AS `gameCountry`,
 1 AS `gameLocation`,
 1 AS `teamId`,
 1 AS `oppTeamId`,
 1 AS `oppTeamConference`,
 1 AS `oppTeamDivision`,
 1 AS `homeOrAway`,
 1 AS `teamScore`,
 1 AS `oppTeamScore`,
 1 AS `wonLostFlag`,
 1 AS `result`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `TeamScheduleView`
--

/*!50001 DROP VIEW IF EXISTS `TeamScheduleView`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `TeamScheduleView` AS select `g`.`id` AS `gameId`,`g`.`seasonYear` AS `seasonYear`,`g`.`gameWeek` AS `scheduleWeek`,`g`.`gameDate` AS `gameDate`,`g`.`gameCity` AS `gameCity`,`g`.`gameStateProvince` AS `gameStateProvince`,`g`.`gameCountry` AS `gameCountry`,`g`.`gameLocation` AS `gameLocation`,`g`.`homeTeamId` AS `teamId`,`g`.`awayTeamId` AS `oppTeamId`,`ht`.`conference` AS `oppTeamConference`,`ht`.`division` AS `oppTeamDivision`,'home' AS `homeOrAway`,`g`.`homeScore` AS `teamScore`,`g`.`awayScore` AS `oppTeamScore`,(case when (`g`.`homeScore` > `g`.`awayScore`) then 'won' when (`g`.`homeScore` < `g`.`awayScore`) then 'lost' when ((`g`.`homeScore` = `g`.`awayScore`) and (`g`.`gameStatus` = 'completed')) then 'tie' else NULL end) AS `wonLostFlag`,(case when (`g`.`homeScore` > `g`.`awayScore`) then 'W' when (`g`.`homeScore` < `g`.`awayScore`) then 'L' when ((`g`.`homeScore` = `g`.`awayScore`) and (`g`.`gameStatus` = 'completed')) then 'T' else NULL end) AS `result` from (`Game` `g` join `Team` `ht` on((`g`.`awayTeamId` = `ht`.`id`))) union all select `g`.`id` AS `gameId`,`g`.`seasonYear` AS `seasonYear`,`g`.`gameWeek` AS `scheduleWeek`,`g`.`gameDate` AS `gameDate`,`g`.`gameCity` AS `gameCity`,`g`.`gameStateProvince` AS `gameStateProvince`,`g`.`gameCountry` AS `gameCountry`,`g`.`gameLocation` AS `gameLocation`,`g`.`awayTeamId` AS `teamId`,`g`.`homeTeamId` AS `oppTeamId`,`at`.`conference` AS `oppTeamConference`,`at`.`division` AS `oppTeamDivision`,'away' AS `homeOrAway`,`g`.`awayScore` AS `teamScore`,`g`.`homeScore` AS `oppTeamScore`,(case when (`g`.`awayScore` > `g`.`homeScore`) then 'won' when (`g`.`awayScore` < `g`.`homeScore`) then 'lost' when ((`g`.`awayScore` = `g`.`homeScore`) and (`g`.`gameStatus` = 'completed')) then 'tie' else NULL end) AS `wonLostFlag`,(case when (`g`.`awayScore` > `g`.`homeScore`) then 'W' when (`g`.`awayScore` < `g`.`homeScore`) then 'L' when ((`g`.`awayScore` = `g`.`homeScore`) and (`g`.`gameStatus` = 'completed')) then 'T' else NULL end) AS `result` from (`Game` `g` join `Team` `at` on((`g`.`homeTeamId` = `at`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Dumping routines for database 'MyNFL'
--
/*!50003 DROP PROCEDURE IF EXISTS `MigratePlayersToProspects` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `MigratePlayersToProspects`()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE pid INT;
  DECLARE pfname VARCHAR(45);
  DECLARE plname VARCHAR(45);
  DECLARE pposition VARCHAR(75);
  DECLARE puniversity VARCHAR(75);
  DECLARE pheight FLOAT;
  DECLARE pweight FLOAT;
  DECLARE phandSize FLOAT;
  DECLARE parmLength FLOAT;
  DECLARE phomeCity VARCHAR(45);
  DECLARE phomeState VARCHAR(45);
  DECLARE pyearEntered DATE;
  DECLARE pcombineId INT;
  DECLARE ppickId INT;
  
  DECLARE pfortyTime FLOAT;
  DECLARE ptenYardSplit FLOAT;
  DECLARE pverticalLeap FLOAT;
  DECLARE pbroadJump FLOAT;
  DECLARE pthreeCone FLOAT;
  DECLARE ptwentyYardShuttle FLOAT;
  
  DECLARE pcurTeamId INT;
  DECLARE pdraftYear INT;
  DECLARE pdraftRound INT;
  DECLARE pdraftNumber INT;
  
  DECLARE cur CURSOR FOR 
    SELECT p.id, p.firstName, p.lastName, p.position, p.university,
           p.height, p.weight, p.handSize, p.armLength, 
           p.homeCity, p.homeState, p.yearEnteredLeague, 
           p.combineScoreId, p.pickId
    FROM Player p;
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  
  read_loop: LOOP
    FETCH cur INTO pid, pfname, plname, pposition, puniversity, 
                    pheight, pweight, phandSize, parmLength,
                    phomeCity, phomeState, pyearEntered,
                    pcombineId, ppickId;
    
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- Get combine data if available
    SELECT fortyTime, tenYardSplit, verticalLeap, broadJump, threeCone, twentyYardShuttle
    INTO pfortyTime, ptenYardSplit, pverticalLeap, pbroadJump, pthreeCone, ptwentyYardShuttle
    FROM Combine_Score
    WHERE id = pcombineId;
    
    -- Get current team if available
    SELECT teamId INTO pcurTeamId
    FROM Player_Team
    WHERE playerId = pid AND current_team = 1
    LIMIT 1;
    
    -- Get draft info if available
    SELECT selectionYear, selectionRound, selectionNumber
    INTO pdraftYear, pdraftRound, pdraftNumber
    FROM Pick
    WHERE id = ppickId;
    
    -- Create prospect record
    INSERT INTO Prospect (
      firstName, lastName, position, college, 
      height, weight, handSize, armLength, 
      homeCity, homeState, 
      fortyTime, tenYardSplit, verticalLeap, broadJump, threeCone, twentyYardShuttle,
      drafted, draftYear, teamId
    ) VALUES (
      pfname, plname, pposition, puniversity,
      pheight, pweight, phandSize, parmLength,
      phomeCity, phomeState,
      pfortyTime, ptenYardSplit, pverticalLeap, pbroadJump, pthreeCone, ptwentyYardShuttle,
      1, -- Set as drafted
      YEAR(IFNULL(pyearEntered, CURDATE())), -- Use year entered league or current year
      pcurTeamId
    );
    
    -- Update the player with the new prospect ID
    UPDATE Player
    SET prospectId = LAST_INSERT_ID()
    WHERE id = pid;
    
    -- If we have pick data, create a draft pick record
    IF pdraftYear IS NOT NULL AND pdraftRound IS NOT NULL AND pdraftNumber IS NOT NULL THEN
      INSERT INTO DraftPick (
        round, pickNumber, draftYear, originalTeamId, currentTeamId, 
        prospectId, playerId, used
      ) 
      SELECT 
        pdraftRound, pdraftNumber, pdraftYear, t.id, t.id, 
        LAST_INSERT_ID(), pid, 1
      FROM Team t
      JOIN Pick p ON p.Team_id = t.id
      WHERE p.id = ppickId
      LIMIT 1;
      
      -- Update the prospect with the new draft pick ID
      UPDATE Prospect
      SET draftPickId = LAST_INSERT_ID()
      WHERE id = LAST_INSERT_ID();
    END IF;
  END LOOP;
  
  CLOSE cur;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `MigrateTeamNeeds` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `MigrateTeamNeeds`()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE tid INT;
  DECLARE tneeds VARCHAR(255);
  DECLARE need VARCHAR(10);
  DECLARE priority INT;
  DECLARE pos INT;
  DECLARE cur CURSOR FOR 
    SELECT id, teamNeeds
    FROM Team
    WHERE teamNeeds IS NOT NULL AND teamNeeds != '';
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  
  read_loop: LOOP
    FETCH cur INTO tid, tneeds;
    
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- Split teamNeeds and insert each position as a separate record
    SET priority = 1;
    process_needs: LOOP
      -- Find the first position (comma or end of string)
      SET pos = LOCATE(',', tneeds);
      
      IF pos = 0 THEN
        -- Last position or only one position
        SET need = TRIM(tneeds);
        
        IF LENGTH(need) > 0 THEN
          INSERT INTO TeamNeed (teamId, position, priority)
          VALUES (tid, need, priority);
        END IF;
        
        LEAVE process_needs;
      ELSE
        -- Extract the position and continue
        SET need = TRIM(SUBSTRING(tneeds, 1, pos - 1));
        
        IF LENGTH(need) > 0 THEN
          INSERT INTO TeamNeed (teamId, position, priority)
          VALUES (tid, need, priority);
        END IF;
        
        SET tneeds = SUBSTRING(tneeds, pos + 1);
        SET priority = priority + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  CLOSE cur;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-06 13:38:46
