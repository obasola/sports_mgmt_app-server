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
-- Table structure for table `CombineScore`
--

DROP TABLE IF EXISTS `CombineScore`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CombineScore` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fortyTime` float DEFAULT NULL,
  `tenYardSplit` float DEFAULT NULL,
  `twentyYardShuttle` float DEFAULT NULL,
  `threeCone` float DEFAULT NULL,
  `verticalLeap` float DEFAULT NULL,
  `playerId` int DEFAULT NULL,
  `broadJump` float(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Combine_Score_1_idx` (`playerId`),
  CONSTRAINT `fk_Combine_Score_1` FOREIGN KEY (`playerId`) REFERENCES `Player` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DraftPick`
--

DROP TABLE IF EXISTS `DraftPick`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DraftPick` (
  `id` int NOT NULL AUTO_INCREMENT,
  `round` int NOT NULL,
  `pickNumber` int NOT NULL,
  `draftYear` int NOT NULL,
  `currentTeamId` int NOT NULL,
  `prospectId` int DEFAULT NULL,
  `playerId` int DEFAULT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `originalTeam` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_draft_pick` (`draftYear`,`round`,`pickNumber`),
  KEY `idx_draftpick_currentteam` (`currentTeamId`,`draftYear`),
  KEY `idx_draftpick_originalteam` (`draftYear`),
  KEY `idx_draftpick_used` (`used`),
  KEY `fk_DraftPick_Prospect_idx` (`prospectId`),
  KEY `fk_DraftPick_Player_idx` (`playerId`),
  CONSTRAINT `fk_DraftPick_CurrentTeam` FOREIGN KEY (`currentTeamId`) REFERENCES `Team` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_DraftPick_Player` FOREIGN KEY (`playerId`) REFERENCES `Player` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_DraftPick_Prospect` FOREIGN KEY (`prospectId`) REFERENCES `Prospect` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Game`
--

DROP TABLE IF EXISTS `Game`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Game` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seasonYear` varchar(4) NOT NULL,
  `gameWeek` tinyint DEFAULT NULL,
  `preseason` tinyint DEFAULT NULL,
  `gameDate` datetime DEFAULT NULL,
  `homeTeamId` int NOT NULL,
  `awayTeamId` int NOT NULL,
  `gameLocation` varchar(255) DEFAULT NULL,
  `gameCity` varchar(100) DEFAULT NULL,
  `gameStateProvince` varchar(100) DEFAULT NULL,
  `gameCountry` varchar(50) DEFAULT 'USA',
  `homeScore` int DEFAULT '0',
  `awayScore` int DEFAULT '0',
  `gameStatus` enum('scheduled','in_progress','completed','cancelled','postponed') DEFAULT 'scheduled',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_game` (`seasonYear`,`gameDate`,`homeTeamId`,`awayTeamId`),
  KEY `homeTeamId` (`homeTeamId`),
  KEY `awayTeamId` (`awayTeamId`),
  CONSTRAINT `Game_ibfk_1` FOREIGN KEY (`homeTeamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Game_ibfk_2` FOREIGN KEY (`awayTeamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Person`
--

DROP TABLE IF EXISTS `Person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Person` (
  `pid` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(25) NOT NULL,
  `emailAddress` varchar(75) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `firstName` varchar(25) NOT NULL,
  `lastName` varchar(35) NOT NULL,
  `rid` int DEFAULT '1',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastLoginAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`pid`),
  KEY `idx_Person_username` (`userName`),
  KEY `idx_Person_email` (`emailAddress`),
  KEY `idx_Person_role` (`rid`),
  CONSTRAINT `fk_Person_role` FOREIGN KEY (`rid`) REFERENCES `roles` (`rid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Player`
--

DROP TABLE IF EXISTS `Player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `age` int NOT NULL,
  `height` tinyint unsigned DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `handSize` int unsigned DEFAULT NULL,
  `armLength` float DEFAULT NULL,
  `homeCity` varchar(45) DEFAULT NULL,
  `homeState` varchar(45) DEFAULT NULL,
  `university` varchar(75) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `position` varchar(75) DEFAULT NULL,
  `pickId` int DEFAULT NULL,
  `combineScoreId` int DEFAULT NULL,
  `prospectId` int DEFAULT NULL,
  `espn_player_id` int DEFAULT NULL,
  `yearEnteredLeague` year DEFAULT NULL,
  `espnId` varchar(50) DEFAULT NULL,
  `displayName` varchar(100) DEFAULT NULL,
  `playerStatus` enum('ACTIVE','INJURED','INACTIVE','SUSPENDED','RETIRED') DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  KEY `fk_Player_Prospect` (`prospectId`),
  KEY `idx_player_espn` (`espn_player_id`),
  CONSTRAINT `fk_player_espn` FOREIGN KEY (`espn_player_id`) REFERENCES `espn_players` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_Player_Prospect` FOREIGN KEY (`prospectId`) REFERENCES `Prospect` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=392 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PlayerAward`
--

DROP TABLE IF EXISTS `PlayerAward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlayerAward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `playerId` int NOT NULL,
  `awardName` varchar(45) DEFAULT NULL,
  `yearAwarded` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_Player_Awards_idx` (`playerId`),
  CONSTRAINT `FK_Player_Awards` FOREIGN KEY (`playerId`) REFERENCES `Player` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PlayerTeam`
--

DROP TABLE IF EXISTS `PlayerTeam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlayerTeam` (
  `id` int NOT NULL AUTO_INCREMENT,
  `playerId` int NOT NULL,
  `teamId` int NOT NULL,
  `currentTeam` tinyint(1) NOT NULL DEFAULT '0',
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `jerseyNumber` int DEFAULT NULL,
  `contractValue` int DEFAULT NULL,
  `contractLength` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_PlayerTeam_Player_idx` (`playerId`),
  KEY `fk_PlayerTeam_Team_idx` (`teamId`),
  CONSTRAINT `fk_PlayerTeam_Player` FOREIGN KEY (`playerId`) REFERENCES `Player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_PlayerTeam_Team` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PostSeasonResult`
--

DROP TABLE IF EXISTS `PostSeasonResult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PostSeasonResult` (
  `id` int NOT NULL AUTO_INCREMENT,
  `playoffYear` year DEFAULT NULL,
  `lastRoundReached` varchar(45) DEFAULT NULL,
  `winLose` varchar(1) DEFAULT NULL,
  `opponentScore` int DEFAULT NULL,
  `teamScore` int DEFAULT NULL,
  `teamId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Team_idx` (`teamId`),
  CONSTRAINT `fk_Team` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prospect`
--

DROP TABLE IF EXISTS `Prospect`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prospect` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `position` varchar(10) NOT NULL,
  `college` varchar(75) NOT NULL,
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `handSize` float DEFAULT NULL,
  `armLength` float DEFAULT NULL,
  `homeCity` varchar(45) DEFAULT NULL,
  `homeState` varchar(45) DEFAULT NULL,
  `fortyTime` float DEFAULT NULL,
  `tenYardSplit` float DEFAULT NULL,
  `verticalLeap` float DEFAULT NULL,
  `broadJump` float(5,2) DEFAULT NULL,
  `threeCone` float DEFAULT NULL,
  `twentyYardShuttle` float DEFAULT NULL,
  `benchPress` int DEFAULT NULL,
  `drafted` tinyint(1) NOT NULL DEFAULT '0',
  `draftYear` year DEFAULT NULL,
  `teamId` int DEFAULT NULL,
  `draftPickId` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prospect_name` (`lastName`,`firstName`),
  KEY `idx_prospect_position` (`position`),
  KEY `idx_prospect_college` (`college`),
  KEY `idx_prospect_drafted` (`drafted`),
  KEY `fk_Prospect_Team_idx` (`teamId`),
  KEY `fk_Prospect_DraftPick` (`draftPickId`),
  CONSTRAINT `fk_Prospect_DraftPick` FOREIGN KEY (`draftPickId`) REFERENCES `DraftPick` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_Prospect_Team` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=900 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `rid` int NOT NULL AUTO_INCREMENT,
  `roleName` varchar(25) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rid`),
  UNIQUE KEY `roleName` (`roleName`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Schedule`
--

DROP TABLE IF EXISTS `Schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teamId` int DEFAULT NULL,
  `seasonYear` year DEFAULT NULL,
  `oppTeamId` int NOT NULL,
  `oppTeamConference` varchar(45) DEFAULT NULL,
  `oppTeamDivision` varchar(45) DEFAULT NULL,
  `scheduleWeek` int DEFAULT NULL,
  `gameDate` date DEFAULT NULL,
  `gameCity` varchar(45) DEFAULT NULL,
  `gameStateProvince` varchar(45) DEFAULT NULL,
  `gameCountry` varchar(45) DEFAULT NULL,
  `gameLocation` varchar(75) DEFAULT NULL,
  `wonLostFlag` varchar(1) DEFAULT NULL,
  `homeOrAway` varchar(1) DEFAULT NULL,
  `oppTeamScore` int DEFAULT NULL,
  `teamScore` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Schedule_1_idx` (`oppTeamId`),
  KEY `fk_Schedule_Team_idx` (`teamId`),
  CONSTRAINT `fk_Schedule_Team` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`),
  CONSTRAINT `fk_Schedule_Visitor` FOREIGN KEY (`oppTeamId`) REFERENCES `Team` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Team`
--

DROP TABLE IF EXISTS `Team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Team` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `conference` varchar(35) DEFAULT NULL,
  `division` varchar(20) DEFAULT NULL,
  `stadium` varchar(45) DEFAULT NULL,
  `scheduleId` int DEFAULT NULL,
  `espn_team_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_team_espn` (`espn_team_id`),
  CONSTRAINT `fk_team_espn` FOREIGN KEY (`espn_team_id`) REFERENCES `espn_teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TeamNeed`
--

DROP TABLE IF EXISTS `TeamNeed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TeamNeed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teamId` int NOT NULL,
  `position` varchar(10) NOT NULL,
  `priority` int NOT NULL DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `draftYear` year DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_position` (`teamId`,`position`),
  KEY `fk_TeamNeed_Team_idx` (`teamId`),
  CONSTRAINT `fk_TeamNeed_Team` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `data_processing_jobs`
--

DROP TABLE IF EXISTS `data_processing_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_processing_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_type` enum('PLAYER_SYNC','TEAM_SYNC','FULL_SYNC','VALIDATION','ENRICHMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `total_records` int unsigned DEFAULT NULL,
  `processed_records` int unsigned DEFAULT '0',
  `failed_records` int unsigned DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_type` (`job_type`),
  KEY `idx_jobs_status` (`status`),
  KEY `idx_jobs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_quality_reports`
--

DROP TABLE IF EXISTS `data_quality_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_quality_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int DEFAULT NULL,
  `entity_type` enum('PLAYER','TEAM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ESPN ID of the entity',
  `quality_score` decimal(5,2) DEFAULT NULL COMMENT 'Overall quality score 0-100',
  `completeness_score` decimal(5,2) DEFAULT NULL,
  `accuracy_score` decimal(5,2) DEFAULT NULL,
  `consistency_score` decimal(5,2) DEFAULT NULL,
  `timeliness_score` decimal(5,2) DEFAULT NULL,
  `issues_found` json DEFAULT NULL COMMENT 'Array of quality issues',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quality_entity` (`entity_type`,`entity_id`),
  KEY `idx_quality_score` (`quality_score`),
  KEY `idx_quality_job` (`job_id`),
  CONSTRAINT `data_quality_reports_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `data_processing_jobs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `espn_players`
--

DROP TABLE IF EXISTS `espn_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `espn_players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` enum('QB','RB','FB','WR','TE','OL','C','G','T','DL','DE','DT','NT','LB','MLB','OLB','DB','CB','S','FS','SS','K','P','LS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `jersey_number` tinyint unsigned DEFAULT NULL,
  `team_espn_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `height` smallint unsigned DEFAULT NULL COMMENT 'Height in inches',
  `weight` smallint unsigned DEFAULT NULL COMMENT 'Weight in pounds',
  `age` tinyint unsigned DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `college` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience` tinyint unsigned DEFAULT NULL COMMENT 'Years of experience',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_rookie` tinyint(1) NOT NULL DEFAULT '0',
  `injury_status` enum('HEALTHY','QUESTIONABLE','DOUBTFUL','OUT','INJURED_RESERVE','PHYSICALLY_UNABLE_TO_PERFORM','NON_FOOTBALL_INJURY','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HEALTHY',
  `injury_description` text COLLATE utf8mb4_unicode_ci,
  `contract_status` enum('SIGNED','UNSIGNED','FRANCHISE_TAG','TRANSITION_TAG','PRACTICE_SQUAD','FUTURES_CONTRACT','UNKNOWN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNKNOWN',
  `salary` bigint DEFAULT NULL COMMENT 'Annual salary in dollars',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_sync_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `espn_id` (`espn_id`),
  KEY `idx_espn_players_espn_id` (`espn_id`),
  KEY `idx_espn_players_team` (`team_espn_id`),
  KEY `idx_espn_players_position` (`position`),
  KEY `idx_espn_players_active` (`is_active`),
  KEY `idx_espn_players_sync` (`last_sync_at`),
  KEY `idx_espn_players_name` (`last_name`,`first_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `espn_teams`
--

DROP TABLE IF EXISTS `espn_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `espn_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conference` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `division` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Primary team color hex',
  `alternate_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Secondary team color hex',
  `logo_url` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_sync_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `espn_id` (`espn_id`),
  KEY `idx_espn_teams_espn_id` (`espn_id`),
  KEY `idx_espn_teams_abbreviation` (`abbreviation`),
  KEY `idx_espn_teams_conference_division` (`conference`,`division`),
  KEY `idx_espn_teams_sync` (`last_sync_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_draft_info`
--

DROP TABLE IF EXISTS `player_draft_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_draft_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_player_id` int NOT NULL,
  `year` year NOT NULL,
  `round` tinyint unsigned NOT NULL,
  `pick` tinyint unsigned NOT NULL,
  `team` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `overall` smallint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_player_draft` (`espn_player_id`),
  KEY `idx_draft_info_player` (`espn_player_id`),
  KEY `idx_draft_info_year` (`year`),
  CONSTRAINT `player_draft_info_ibfk_1` FOREIGN KEY (`espn_player_id`) REFERENCES `espn_players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_headshots`
--

DROP TABLE IF EXISTS `player_headshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_headshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_player_id` int NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `width` smallint unsigned DEFAULT NULL,
  `height` smallint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_headshots_player` (`espn_player_id`),
  CONSTRAINT `player_headshots_ibfk_1` FOREIGN KEY (`espn_player_id`) REFERENCES `espn_players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_metadata`
--

DROP TABLE IF EXISTS `player_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_metadata` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_player_id` int NOT NULL,
  `meta_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_value` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_player_meta` (`espn_player_id`,`meta_key`),
  KEY `idx_metadata_player` (`espn_player_id`),
  KEY `idx_metadata_key` (`meta_key`),
  CONSTRAINT `player_metadata_ibfk_1` FOREIGN KEY (`espn_player_id`) REFERENCES `espn_players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_statistics`
--

DROP TABLE IF EXISTS `player_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_player_id` int NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., passing, rushing, receiving, defense',
  `stat_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stat_value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'String to handle both numeric and text values',
  `season_year` year DEFAULT NULL,
  `season_type` enum('REGULAR','PLAYOFFS','PRESEASON') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_statistics_player` (`espn_player_id`),
  KEY `idx_statistics_category` (`category`),
  KEY `idx_statistics_season` (`season_year`,`season_type`),
  KEY `idx_statistics_stat` (`stat_name`),
  CONSTRAINT `player_statistics_ibfk_1` FOREIGN KEY (`espn_player_id`) REFERENCES `espn_players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `processing_metrics`
--

DROP TABLE IF EXISTS `processing_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `processing_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `metric_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric_value` decimal(15,4) NOT NULL,
  `metric_unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_id` int DEFAULT NULL,
  `execution_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_metrics_name` (`metric_name`),
  KEY `idx_metrics_recorded` (`recorded_at`),
  KEY `idx_metrics_job` (`job_id`),
  KEY `fk_metrics_execution` (`execution_id`),
  CONSTRAINT `processing_metrics_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `data_processing_jobs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `processing_metrics_ibfk_2` FOREIGN KEY (`execution_id`) REFERENCES `workflow_executions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `rid` int NOT NULL AUTO_INCREMENT,
  `roleName` varchar(25) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rid`),
  UNIQUE KEY `roleName` (`roleName`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflow_executions`
--

DROP TABLE IF EXISTS `workflow_executions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_executions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID for workflow execution',
  `workflow_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `input_data` json DEFAULT NULL,
  `output_data` json DEFAULT NULL,
  `current_step` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `steps_completed` int unsigned DEFAULT '0',
  `total_steps` int unsigned NOT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workflow_id` (`workflow_id`),
  KEY `idx_workflow_status` (`status`),
  KEY `idx_workflow_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflow_step_results`
--

DROP TABLE IF EXISTS `workflow_step_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_step_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `execution_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED','SKIPPED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `input_data` json DEFAULT NULL,
  `output_data` json DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `duration_ms` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_step_execution` (`execution_id`),
  KEY `idx_step_status` (`status`),
  CONSTRAINT `workflow_step_results_ibfk_1` FOREIGN KEY (`execution_id`) REFERENCES `workflow_executions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-09 17:16:06
