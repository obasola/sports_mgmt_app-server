CREATE DATABASE  IF NOT EXISTS `MyNFL` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `MyNFL`;
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
-- Dumping data for table `DraftPick`
--

LOCK TABLES `DraftPick` WRITE;
/*!40000 ALTER TABLE `DraftPick` DISABLE KEYS */;
INSERT INTO `DraftPick` VALUES (1,1,1,2025,89,NULL,NULL,1,'2025-04-25 00:59:11','2025-04-25 00:59:11',NULL),(3,1,2,2025,76,NULL,NULL,1,'2025-04-25 01:30:48','2025-04-25 01:30:48',69),(4,1,9,2025,92,NULL,45,1,'2025-05-06 09:08:46','2025-05-06 09:08:46',92);
/*!40000 ALTER TABLE `DraftPick` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-15  7:05:30
