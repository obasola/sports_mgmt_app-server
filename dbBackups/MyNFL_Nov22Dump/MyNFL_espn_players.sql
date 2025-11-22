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
-- Table structure for table `espn_players`
--

DROP TABLE IF EXISTS `espn_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `espn_players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` enum('QB','RB','FB','WR','TE','OL','C','G','T','DL','DE','DT','NT','LB','MLB','OLB','DB','CB','S','FS','SS','K','P','LS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jersey_number` tinyint unsigned DEFAULT NULL,
  `team_espn_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `height` smallint unsigned DEFAULT NULL COMMENT 'Height in inches',
  `weight` smallint unsigned DEFAULT NULL COMMENT 'Weight in pounds',
  `age` tinyint unsigned DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `college` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience` tinyint unsigned DEFAULT NULL COMMENT 'Years of experience',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_rookie` tinyint(1) NOT NULL DEFAULT '0',
  `injury_status` enum('HEALTHY','QUESTIONABLE','DOUBTFUL','OUT','INJURED_RESERVE','PHYSICALLY_UNABLE_TO_PERFORM','NON_FOOTBALL_INJURY','SUSPENDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HEALTHY',
  `injury_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `contract_status` enum('SIGNED','UNSIGNED','FRANCHISE_TAG','TRANSITION_TAG','PRACTICE_SQUAD','FUTURES_CONTRACT','UNKNOWN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNKNOWN',
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `espn_players`
--

LOCK TABLES `espn_players` WRITE;
/*!40000 ALTER TABLE `espn_players` DISABLE KEYS */;
INSERT INTO `espn_players` VALUES (1,'14881','Patrick','Mahomes','Patrick Mahomes','P. Mahomes','QB',15,'12',75,225,29,'1995-09-17','Texas Tech',7,1,0,'HEALTHY',NULL,'UNKNOWN',NULL,'2025-08-10 08:31:57','2025-08-10 05:03:19','2025-08-10 10:03:20'),(2,'3117251','Travis','Kelce','Travis Kelce','T. Kelce','TE',87,'12',77,260,35,'1989-10-05','Cincinnati',11,1,0,'HEALTHY',NULL,'UNKNOWN',NULL,'2025-08-10 08:31:57','2025-08-10 05:03:19','2025-08-10 10:03:20');
/*!40000 ALTER TABLE `espn_players` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-22 17:26:15
