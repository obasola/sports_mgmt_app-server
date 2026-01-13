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
-- Table structure for table `FeatureDomain`
--

DROP TABLE IF EXISTS `FeatureDomain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FeatureDomain` (
  `domainId` int NOT NULL AUTO_INCREMENT,
  `domainCode` varchar(50) NOT NULL,
  `displayName` varchar(100) NOT NULL,
  `isMaintenance` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`domainId`),
  UNIQUE KEY `domainCode` (`domainCode`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FeatureDomain`
--

LOCK TABLES `FeatureDomain` WRITE;
/*!40000 ALTER TABLE `FeatureDomain` DISABLE KEYS */;
INSERT INTO `FeatureDomain` VALUES (1,'TEAMS','Teams',0,'2026-01-12 17:46:26'),(2,'PLAYERS','Players',0,'2026-01-12 17:46:26'),(3,'GAMES','Games',0,'2026-01-12 17:46:26'),(4,'DRAFT','Draft',0,'2026-01-12 17:46:26'),(5,'TEAM_NEEDS','Team Needs',0,'2026-01-12 17:46:26'),(6,'JOBS','Jobs',1,'2026-01-12 17:46:26'),(7,'SCRAPERS','Scrapers',1,'2026-01-12 17:46:26'),(8,'SCHEDULING','Scheduling',1,'2026-01-12 17:46:26'),(9,'DASHBOARD','Dashboard',0,'2026-01-12 19:08:01'),(10,'SCHEDULES','Schedules',0,'2026-01-12 19:08:01'),(11,'STANDINGS','Standings',0,'2026-01-12 19:08:01'),(12,'PLAYOFFS','Playoffs',0,'2026-01-12 19:08:01'),(13,'DRAFT_ORDER','Draft Order',0,'2026-01-12 19:08:01'),(14,'DRAFT_TOOLS','Draft Tools',0,'2026-01-12 19:08:01'),(15,'SCOUTING','Scouting',0,'2026-01-12 19:08:01'),(16,'PLAYER_MAINT','Player Maintenance',1,'2026-01-12 19:08:01'),(17,'ADMIN_USERS','User Administration',1,'2026-01-12 19:08:01'),(18,'RBAC','Roles & Permissions',1,'2026-01-12 19:08:01');
/*!40000 ALTER TABLE `FeatureDomain` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-13 15:54:03
