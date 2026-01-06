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
-- Table structure for table `DraftSimulationPick`
--

DROP TABLE IF EXISTS `DraftSimulationPick`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DraftSimulationPick` (
  `id` int NOT NULL AUTO_INCREMENT,
  `draftSimulationId` int NOT NULL,
  `roundNbr` tinyint NOT NULL,
  `pickInRound` tinyint NOT NULL,
  `overallPick` smallint NOT NULL,
  `originalTeamId` int NOT NULL,
  `currentTeamId` int NOT NULL,
  `draftedProspectId` int DEFAULT NULL,
  `draftedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_DSP_sim_overall` (`draftSimulationId`,`overallPick`),
  KEY `idx_DSP_sim_round` (`draftSimulationId`,`roundNbr`),
  KEY `idx_DSP_sim_team` (`draftSimulationId`,`currentTeamId`),
  KEY `idx_DSP_sim_drafted` (`draftSimulationId`,`draftedProspectId`),
  KEY `fk_DSP_Team_original` (`originalTeamId`),
  KEY `fk_DSP_Team_current` (`currentTeamId`),
  KEY `fk_DSP_Prospect` (`draftedProspectId`),
  CONSTRAINT `fk_DSP_DraftSimulation` FOREIGN KEY (`draftSimulationId`) REFERENCES `DraftSimulation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_DSP_Prospect` FOREIGN KEY (`draftedProspectId`) REFERENCES `Prospect` (`id`),
  CONSTRAINT `fk_DSP_Team_current` FOREIGN KEY (`currentTeamId`) REFERENCES `Team` (`id`),
  CONSTRAINT `fk_DSP_Team_original` FOREIGN KEY (`originalTeamId`) REFERENCES `Team` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DraftSimulationPick`
--

LOCK TABLES `DraftSimulationPick` WRITE;
/*!40000 ALTER TABLE `DraftSimulationPick` DISABLE KEYS */;
/*!40000 ALTER TABLE `DraftSimulationPick` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-06 13:38:46
