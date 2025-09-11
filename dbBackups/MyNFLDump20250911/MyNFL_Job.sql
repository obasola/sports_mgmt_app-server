CREATE DATABASE  IF NOT EXISTS `MyNFL` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `MyNFL`;
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: MyNFL
-- ------------------------------------------------------
-- Server version	8.0.37-0ubuntu0.23.10.2

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
-- Table structure for table `Job`
--

DROP TABLE IF EXISTS `Job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Job` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  `payload` json DEFAULT NULL,
  `status` enum('pending','in_progress','completed','failed','canceled') NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `startedAt` datetime(3) DEFAULT NULL,
  `finishedAt` datetime(3) DEFAULT NULL,
  `cancelAt` datetime(3) DEFAULT NULL,
  `cancelReason` varchar(255) DEFAULT NULL,
  `resultCode` varchar(50) DEFAULT NULL,
  `resultJson` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Job_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Job`
--

LOCK TABLES `Job` WRITE;
/*!40000 ALTER TABLE `Job` DISABLE KEYS */;
INSERT INTO `Job` VALUES (1,'IMPORT_NFL_SEASON','{\"year\": 2025, \"seasons\": [\"pre\", \"reg\"]}','completed','2025-09-01 18:22:59.814','2025-09-01 18:22:59.822','2025-09-01 18:23:06.082',NULL,NULL,'OK','{\"skipped\": 0, \"updated\": 0, \"failures\": [], \"inserted\": 321}'),(2,'IMPORT_NFL_SEASON','{\"year\": 2025, \"seasons\": [\"pre\", \"reg\"]}','completed','2025-09-01 18:25:04.499','2025-09-01 18:25:04.524','2025-09-01 18:25:10.929',NULL,NULL,'OK','{\"skipped\": 0, \"updated\": 321, \"failures\": [], \"inserted\": 0}'),(3,'IMPORT_NFL_SEASON','{\"year\": 2025, \"seasons\": [\"pre\", \"reg\"]}','completed','2025-09-01 18:25:59.524','2025-09-01 18:25:59.534','2025-09-01 18:26:07.379',NULL,NULL,'OK','{\"skipped\": 0, \"updated\": 321, \"failures\": [], \"inserted\": 0}'),(4,'IMPORT_NFL_SEASON','{\"year\": 2025, \"seasons\": [\"pre\", \"reg\"]}','completed','2025-09-01 18:26:16.525','2025-09-01 18:26:16.534','2025-09-01 18:26:22.531',NULL,NULL,'OK','{\"skipped\": 0, \"updated\": 321, \"failures\": [], \"inserted\": 0}'),(5,'IMPORT_NFL_SEASON','{\"year\": 2025, \"seasons\": [\"pre\", \"reg\"]}','completed','2025-09-01 18:36:39.209','2025-09-01 18:36:39.217','2025-09-01 18:36:43.462',NULL,NULL,'OK','{\"skipped\": 321, \"updated\": 0, \"failures\": [], \"inserted\": 0}');
/*!40000 ALTER TABLE `Job` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-11 12:51:04
