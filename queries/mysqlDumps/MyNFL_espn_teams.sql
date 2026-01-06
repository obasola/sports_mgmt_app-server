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
-- Table structure for table `espn_teams`
--

DROP TABLE IF EXISTS `espn_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `espn_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `espn_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `division` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Primary team color hex',
  `alternate_color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Secondary team color hex',
  `logo_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `espn_teams`
--

LOCK TABLES `espn_teams` WRITE;
/*!40000 ALTER TABLE `espn_teams` DISABLE KEYS */;
INSERT INTO `espn_teams` VALUES (1,'12','Chiefs','Kansas City Chiefs','KC',NULL,'Kansas City',NULL,NULL,NULL,'e31837','ffb612','https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',1,'2025-08-10 08:27:34','2025-09-28 19:31:06','2025-09-29 00:31:06'),(2,'8','Lions','Detroit Lions','DET',NULL,'Detroit',NULL,NULL,NULL,'0076b6','bbbbbb','https://a.espncdn.com/i/teamlogos/nfl/500/det.png',1,'2025-08-10 08:27:34','2025-09-28 19:31:06','2025-09-29 00:31:06'),(3,'22','Cardinals','Arizona Cardinals','ARI',NULL,'Arizona',NULL,NULL,NULL,'a40227','ffffff','https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(4,'1','Falcons','Atlanta Falcons','ATL',NULL,'Atlanta',NULL,NULL,NULL,'a71930','000000','https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(5,'33','Ravens','Baltimore Ravens','BAL',NULL,'Baltimore',NULL,NULL,NULL,'29126f','000000','https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(6,'2','Bills','Buffalo Bills','BUF',NULL,'Buffalo',NULL,NULL,NULL,'00338d','d50a0a','https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(7,'29','Panthers','Carolina Panthers','CAR',NULL,'Carolina',NULL,NULL,NULL,'0085ca','000000','https://a.espncdn.com/i/teamlogos/nfl/500/car.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(8,'3','Bears','Chicago Bears','CHI',NULL,'Chicago',NULL,NULL,NULL,'0b1c3a','e64100','https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(9,'4','Bengals','Cincinnati Bengals','CIN',NULL,'Cincinnati',NULL,NULL,NULL,'fb4f14','000000','https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(10,'5','Browns','Cleveland Browns','CLE',NULL,'Cleveland',NULL,NULL,NULL,'472a08','ff3c00','https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(11,'6','Cowboys','Dallas Cowboys','DAL',NULL,'Dallas',NULL,NULL,NULL,'002a5c','b0b7bc','https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(12,'7','Broncos','Denver Broncos','DEN',NULL,'Denver',NULL,NULL,NULL,'0a2343','fc4c02','https://a.espncdn.com/i/teamlogos/nfl/500/den.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(13,'9','Packers','Green Bay Packers','GB',NULL,'Green Bay',NULL,NULL,NULL,'204e32','ffb612','https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(14,'34','Texans','Houston Texans','HOU',NULL,'Houston',NULL,NULL,NULL,'00143f','c41230','https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(15,'11','Colts','Indianapolis Colts','IND',NULL,'Indianapolis',NULL,NULL,NULL,'003b75','ffffff','https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(16,'30','Jaguars','Jacksonville Jaguars','JAX',NULL,'Jacksonville',NULL,NULL,NULL,'007487','d7a22a','https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(17,'13','Raiders','Las Vegas Raiders','LV',NULL,'Las Vegas',NULL,NULL,NULL,'000000','a5acaf','https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(18,'24','Chargers','Los Angeles Chargers','LAC',NULL,'Los Angeles',NULL,NULL,NULL,'0080c6','ffc20e','https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(19,'14','Rams','Los Angeles Rams','LAR',NULL,'Los Angeles',NULL,NULL,NULL,'003594','ffd100','https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:06'),(20,'15','Dolphins','Miami Dolphins','MIA',NULL,'Miami',NULL,NULL,NULL,'008e97','fc4c02','https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(21,'16','Vikings','Minnesota Vikings','MIN',NULL,'Minnesota',NULL,NULL,NULL,'4f2683','ffc62f','https://a.espncdn.com/i/teamlogos/nfl/500/min.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(22,'17','Patriots','New England Patriots','NE',NULL,'New England',NULL,NULL,NULL,'002a5c','c60c30','https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(23,'18','Saints','New Orleans Saints','NO',NULL,'New Orleans',NULL,NULL,NULL,'d3bc8d','000000','https://a.espncdn.com/i/teamlogos/nfl/500/no.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(24,'19','Giants','New York Giants','NYG',NULL,'New York',NULL,NULL,NULL,'003c7f','c9243f','https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(25,'20','Jets','New York Jets','NYJ',NULL,'New York',NULL,NULL,NULL,'115740','ffffff','https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(26,'21','Eagles','Philadelphia Eagles','PHI',NULL,'Philadelphia',NULL,NULL,NULL,'06424d','000000','https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(27,'23','Steelers','Pittsburgh Steelers','PIT',NULL,'Pittsburgh',NULL,NULL,NULL,'000000','ffb612','https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(28,'25','49ers','San Francisco 49ers','SF',NULL,'San Francisco',NULL,NULL,NULL,'aa0000','b3995d','https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(29,'26','Seahawks','Seattle Seahawks','SEA',NULL,'Seattle',NULL,NULL,NULL,'002a5c','69be28','https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(30,'27','Buccaneers','Tampa Bay Buccaneers','TB',NULL,'Tampa Bay',NULL,NULL,NULL,'bd1c36','3e3a35','https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(31,'10','Titans','Tennessee Titans','TEN',NULL,'Tennessee',NULL,NULL,NULL,'4b92db','002a5c','https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07'),(32,'28','Commanders','Washington Commanders','WSH',NULL,'Washington',NULL,NULL,NULL,'5a1414','ffb612','https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',1,'2025-08-12 15:07:19','2025-09-28 19:31:06','2025-09-29 00:31:07');
/*!40000 ALTER TABLE `espn_teams` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-06 13:38:45
