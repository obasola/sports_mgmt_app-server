
-- -----------------------------------------------------
-- Schema MyNFL
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `MyNFL` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `MyNFL` ;

-- -----------------------------------------------------
-- Table `MyNFL`.`Team`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`Team` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `city` VARCHAR(45) NULL DEFAULT NULL,
  `state` VARCHAR(45) NULL DEFAULT NULL,
  `conference` VARCHAR(35) NULL DEFAULT NULL,
  `division` VARCHAR(20) NULL DEFAULT NULL,
  `stadium` VARCHAR(45) NULL DEFAULT NULL,
  `scheduleId` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 97
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`DraftPick`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`DraftPick` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `round` INT NOT NULL,
  `pickNumber` INT NOT NULL,
  `draftYear` INT NOT NULL,
  `currentTeamId` INT NOT NULL,
  `prospectId` INT NULL DEFAULT NULL,
  `playerId` INT NULL DEFAULT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT '0',
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `originalTeam` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_draft_pick` (`draftYear` ASC, `round` ASC, `pickNumber` ASC) VISIBLE,
  INDEX `idx_draftpick_currentteam` (`currentTeamId` ASC, `draftYear` ASC) VISIBLE,
  INDEX `idx_draftpick_originalteam` (`draftYear` ASC) VISIBLE,
  INDEX `idx_draftpick_used` (`used` ASC) VISIBLE,
  INDEX `fk_DraftPick_Prospect_idx` (`prospectId` ASC) VISIBLE,
  INDEX `fk_DraftPick_Player_idx` (`playerId` ASC) VISIBLE,
  CONSTRAINT `fk_DraftPick_CurrentTeam`
    FOREIGN KEY (`currentTeamId`)
    REFERENCES `MyNFL`.`Team` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_DraftPick_Player`
    FOREIGN KEY (`playerId`)
    REFERENCES `MyNFL`.`Player` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_DraftPick_Prospect`
    FOREIGN KEY (`prospectId`)
    REFERENCES `MyNFL`.`Prospect` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`Prospect`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`Prospect` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(45) NOT NULL,
  `lastName` VARCHAR(45) NOT NULL,
  `position` VARCHAR(10) NOT NULL,
  `college` VARCHAR(75) NOT NULL,
  `height` FLOAT NULL DEFAULT NULL,
  `weight` FLOAT NULL DEFAULT NULL,
  `handSize` FLOAT NULL DEFAULT NULL,
  `armLength` FLOAT NULL DEFAULT NULL,
  `homeCity` VARCHAR(45) NULL DEFAULT NULL,
  `homeState` VARCHAR(45) NULL DEFAULT NULL,
  `fortyTime` FLOAT NULL DEFAULT NULL,
  `tenYardSplit` FLOAT NULL DEFAULT NULL,
  `verticalLeap` FLOAT NULL DEFAULT NULL,
  `broadJump` FLOAT(5,2) NULL DEFAULT NULL,
  `threeCone` FLOAT NULL DEFAULT NULL,
  `twentyYardShuttle` FLOAT NULL DEFAULT NULL,
  `benchPress` INT NULL DEFAULT NULL,
  `drafted` TINYINT(1) NOT NULL DEFAULT '0',
  `draftYear` YEAR NULL DEFAULT NULL,
  `teamId` INT NULL DEFAULT NULL,
  `draftPickId` INT NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prospect_name` (`lastName` ASC, `firstName` ASC) VISIBLE,
  INDEX `idx_prospect_position` (`position` ASC) VISIBLE,
  INDEX `idx_prospect_college` (`college` ASC) VISIBLE,
  INDEX `idx_prospect_drafted` (`drafted` ASC) VISIBLE,
  INDEX `fk_Prospect_Team_idx` (`teamId` ASC) VISIBLE,
  INDEX `fk_Prospect_DraftPick` (`draftPickId` ASC) VISIBLE,
  CONSTRAINT `fk_Prospect_DraftPick`
    FOREIGN KEY (`draftPickId`)
    REFERENCES `MyNFL`.`DraftPick` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Prospect_Team`
    FOREIGN KEY (`teamId`)
    REFERENCES `MyNFL`.`Team` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 900
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`Player`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`Player` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(45) NOT NULL,
  `lastName` VARCHAR(45) NOT NULL,
  `age` INT NOT NULL,
  `height` TINYINT UNSIGNED NULL DEFAULT NULL,
  `weight` FLOAT NULL DEFAULT NULL,
  `handSize` INT UNSIGNED NULL DEFAULT NULL,
  `armLength` FLOAT NULL DEFAULT NULL,
  `homeCity` VARCHAR(45) NULL DEFAULT NULL,
  `homeState` VARCHAR(45) NULL DEFAULT NULL,
  `university` VARCHAR(75) NULL DEFAULT NULL,
  `status` VARCHAR(45) NULL DEFAULT NULL,
  `position` VARCHAR(75) NULL DEFAULT NULL,
  `pickId` INT NULL DEFAULT NULL,
  `combineScoreId` INT NULL DEFAULT NULL,
  `prospectId` INT NULL DEFAULT NULL,
  `yearEnteredLeague` YEAR NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Player_Prospect` (`prospectId` ASC) VISIBLE,
  CONSTRAINT `fk_Player_Prospect`
    FOREIGN KEY (`prospectId`)
    REFERENCES `MyNFL`.`Prospect` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 392
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`CombineScore`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`CombineScore` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fortyTime` FLOAT NULL DEFAULT NULL,
  `tenYardSplit` FLOAT NULL DEFAULT NULL,
  `twentyYardShuttle` FLOAT NULL DEFAULT NULL,
  `threeCone` FLOAT NULL DEFAULT NULL,
  `verticalLeap` FLOAT NULL DEFAULT NULL,
  `playerId` INT NULL DEFAULT NULL,
  `broadJump` FLOAT(5,2) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Combine_Score_1_idx` (`playerId` ASC) VISIBLE,
  CONSTRAINT `fk_Combine_Score_1`
    FOREIGN KEY (`playerId`)
    REFERENCES `MyNFL`.`Player` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`Game`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`Game` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `seasonYear` VARCHAR(4) NOT NULL,
  `gameWeek` TINYINT NULL DEFAULT NULL,
  `preseason` TINYINT NULL DEFAULT NULL,
  `gameDate` DATETIME NULL DEFAULT NULL,
  `homeTeamId` INT NOT NULL,
  `awayTeamId` INT NOT NULL,
  `gameLocation` VARCHAR(255) NULL DEFAULT NULL,
  `gameCity` VARCHAR(100) NULL DEFAULT NULL,
  `gameStateProvince` VARCHAR(100) NULL DEFAULT NULL,
  `gameCountry` VARCHAR(50) NULL DEFAULT 'USA',
  `homeScore` INT NULL DEFAULT '0',
  `awayScore` INT NULL DEFAULT '0',
  `gameStatus` ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed') NULL DEFAULT 'scheduled',
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_game` (`seasonYear` ASC, `gameDate` ASC, `homeTeamId` ASC, `awayTeamId` ASC) VISIBLE,
  INDEX `homeTeamId` (`homeTeamId` ASC) VISIBLE,
  INDEX `awayTeamId` (`awayTeamId` ASC) VISIBLE,
  CONSTRAINT `Game_ibfk_1`
    FOREIGN KEY (`homeTeamId`)
    REFERENCES `MyNFL`.`Team` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `Game_ibfk_2`
    FOREIGN KEY (`awayTeamId`)
    REFERENCES `MyNFL`.`Team` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 28
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`Person`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`Person` (
  `pid` INT NOT NULL AUTO_INCREMENT,
  `userName` VARCHAR(25) NOT NULL,
  `emailAddress` VARCHAR(75) NOT NULL,
  `password` VARCHAR(25) NOT NULL,
  `firstName` VARCHAR(25) NOT NULL,
  `lastName` VARCHAR(35) NOT NULL,
  PRIMARY KEY (`pid`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`PlayerAward`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`PlayerAward` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `playerId` INT NOT NULL,
  `awardName` VARCHAR(45) NULL DEFAULT NULL,
  `yearAwarded` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_Player_Awards_idx` (`playerId` ASC) VISIBLE,
  CONSTRAINT `FK_Player_Awards`
    FOREIGN KEY (`playerId`)
    REFERENCES `MyNFL`.`Player` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`PlayerTeam`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`PlayerTeam` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `playerId` INT NOT NULL,
  `teamId` INT NOT NULL,
  `currentTeam` TINYINT(1) NOT NULL DEFAULT '0',
  `startDate` DATE NULL DEFAULT NULL,
  `endDate` DATE NULL DEFAULT NULL,
  `jerseyNumber` INT NULL DEFAULT NULL,
  `contractValue` INT NULL DEFAULT NULL,
  `contractLength` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_PlayerTeam_Player_idx` (`playerId` ASC) VISIBLE,
  INDEX `fk_PlayerTeam_Team_idx` (`teamId` ASC) VISIBLE,
  CONSTRAINT `fk_PlayerTeam_Player`
    FOREIGN KEY (`playerId`)
    REFERENCES `MyNFL`.`Player` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_PlayerTeam_Team`
    FOREIGN KEY (`teamId`)
    REFERENCES `MyNFL`.`Team` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`PostSeasonResult`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`PostSeasonResult` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `playoffYear` YEAR NULL DEFAULT NULL,
  `lastRoundReached` VARCHAR(45) NULL DEFAULT NULL,
  `winLose` VARCHAR(1) NULL DEFAULT NULL,
  `opponentScore` INT NULL DEFAULT NULL,
  `teamScore` INT NULL DEFAULT NULL,
  `teamId` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Team_idx` (`teamId` ASC) VISIBLE,
  CONSTRAINT `fk_Team`
    FOREIGN KEY (`teamId`)
    REFERENCES `MyNFL`.`Team` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`Schedule`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`Schedule` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `teamId` INT NULL DEFAULT NULL,
  `seasonYear` YEAR NULL DEFAULT NULL,
  `oppTeamId` INT NOT NULL,
  `oppTeamConference` VARCHAR(45) NULL DEFAULT NULL,
  `oppTeamDivision` VARCHAR(45) NULL DEFAULT NULL,
  `scheduleWeek` INT NULL DEFAULT NULL,
  `gameDate` DATE NULL DEFAULT NULL,
  `gameCity` VARCHAR(45) NULL DEFAULT NULL,
  `gameStateProvince` VARCHAR(45) NULL DEFAULT NULL,
  `gameCountry` VARCHAR(45) NULL DEFAULT NULL,
  `gameLocation` VARCHAR(75) NULL DEFAULT NULL,
  `wonLostFlag` VARCHAR(1) NULL DEFAULT NULL,
  `homeOrAway` VARCHAR(1) NULL DEFAULT NULL,
  `oppTeamScore` INT NULL DEFAULT NULL,
  `teamScore` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Schedule_1_idx` (`oppTeamId` ASC) VISIBLE,
  INDEX `fk_Schedule_Team_idx` (`teamId` ASC) VISIBLE,
  CONSTRAINT `fk_Schedule_Team`
    FOREIGN KEY (`teamId`)
    REFERENCES `MyNFL`.`Team` (`id`),
  CONSTRAINT `fk_Schedule_Visitor`
    FOREIGN KEY (`oppTeamId`)
    REFERENCES `MyNFL`.`Team` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `MyNFL`.`TeamNeed`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`TeamNeed` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `teamId` INT NOT NULL,
  `position` VARCHAR(10) NOT NULL,
  `priority` INT NOT NULL DEFAULT '1',
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `draftYear` YEAR NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_team_position` (`teamId` ASC, `position` ASC) VISIBLE,
  INDEX `fk_TeamNeed_Team_idx` (`teamId` ASC) VISIBLE,
  CONSTRAINT `fk_TeamNeed_Team`
    FOREIGN KEY (`teamId`)
    REFERENCES `MyNFL`.`Team` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

USE `MyNFL` ;

-- -----------------------------------------------------
-- Placeholder table for view `MyNFL`.`TeamScheduleView`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MyNFL`.`TeamScheduleView` (`gameId` INT, `seasonYear` INT, `scheduleWeek` INT, `gameDate` INT, `gameCity` INT, `gameStateProvince` INT, `gameCountry` INT, `gameLocation` INT, `teamId` INT, `oppTeamId` INT, `oppTeamConference` INT, `oppTeamDivision` INT, `homeOrAway` INT, `teamScore` INT, `oppTeamScore` INT, `wonLostFlag` INT, `result` INT);

-- -----------------------------------------------------
-- procedure MigratePlayersToProspects
-- -----------------------------------------------------

DELIMITER $$
USE `MyNFL`$$
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
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure MigrateTeamNeeds
-- -----------------------------------------------------

DELIMITER $$
USE `MyNFL`$$
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
END$$

DELIMITER ;

-- -----------------------------------------------------
-- View `MyNFL`.`TeamScheduleView`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `MyNFL`.`TeamScheduleView`;
USE `MyNFL`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `MyNFL`.`TeamScheduleView` AS select `g`.`id` AS `gameId`,`g`.`seasonYear` AS `seasonYear`,`g`.`gameWeek` AS `scheduleWeek`,`g`.`gameDate` AS `gameDate`,`g`.`gameCity` AS `gameCity`,`g`.`gameStateProvince` AS `gameStateProvince`,`g`.`gameCountry` AS `gameCountry`,`g`.`gameLocation` AS `gameLocation`,`g`.`homeTeamId` AS `teamId`,`g`.`awayTeamId` AS `oppTeamId`,`ht`.`conference` AS `oppTeamConference`,`ht`.`division` AS `oppTeamDivision`,'home' AS `homeOrAway`,`g`.`homeScore` AS `teamScore`,`g`.`awayScore` AS `oppTeamScore`,(case when (`g`.`homeScore` > `g`.`awayScore`) then 'won' when (`g`.`homeScore` < `g`.`awayScore`) then 'lost' when ((`g`.`homeScore` = `g`.`awayScore`) and (`g`.`gameStatus` = 'completed')) then 'tie' else NULL end) AS `wonLostFlag`,(case when (`g`.`homeScore` > `g`.`awayScore`) then 'W' when (`g`.`homeScore` < `g`.`awayScore`) then 'L' when ((`g`.`homeScore` = `g`.`awayScore`) and (`g`.`gameStatus` = 'completed')) then 'T' else NULL end) AS `result` from (`MyNFL`.`Game` `g` join `MyNFL`.`Team` `ht` on((`g`.`awayTeamId` = `ht`.`id`))) union all select `g`.`id` AS `gameId`,`g`.`seasonYear` AS `seasonYear`,`g`.`gameWeek` AS `scheduleWeek`,`g`.`gameDate` AS `gameDate`,`g`.`gameCity` AS `gameCity`,`g`.`gameStateProvince` AS `gameStateProvince`,`g`.`gameCountry` AS `gameCountry`,`g`.`gameLocation` AS `gameLocation`,`g`.`awayTeamId` AS `teamId`,`g`.`homeTeamId` AS `oppTeamId`,`at`.`conference` AS `oppTeamConference`,`at`.`division` AS `oppTeamDivision`,'away' AS `homeOrAway`,`g`.`awayScore` AS `teamScore`,`g`.`homeScore` AS `oppTeamScore`,(case when (`g`.`awayScore` > `g`.`homeScore`) then 'won' when (`g`.`awayScore` < `g`.`homeScore`) then 'lost' when ((`g`.`awayScore` = `g`.`homeScore`) and (`g`.`gameStatus` = 'completed')) then 'tie' else NULL end) AS `wonLostFlag`,(case when (`g`.`awayScore` > `g`.`homeScore`) then 'W' when (`g`.`awayScore` < `g`.`homeScore`) then 'L' when ((`g`.`awayScore` = `g`.`homeScore`) and (`g`.`gameStatus` = 'completed')) then 'T' else NULL end) AS `result` from (`MyNFL`.`Game` `g` join `MyNFL`.`Team` `at` on((`g`.`homeTeamId` = `at`.`id`)));

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
USE `MyNFL`;

DELIMITER $$
USE `MyNFL`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `MyNFL`.`set_timestamps_before_insert`
BEFORE INSERT ON `MyNFL`.`TeamNeed`
FOR EACH ROW
BEGIN
  SET NEW.createdAt = CURRENT_TIMESTAMP;
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

USE `MyNFL`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `MyNFL`.`set_updatedAt_before_update`
BEFORE UPDATE ON `MyNFL`.`TeamNeed`
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$


DELIMITER ;

