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
-- Table structure for table `data_processing_jobs`
--

DROP TABLE IF EXISTS `data_processing_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_processing_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_type` enum('PLAYER_SYNC','TEAM_SYNC','FULL_SYNC','VALIDATION','ENRICHMENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `total_records` int unsigned DEFAULT NULL,
  `processed_records` int unsigned DEFAULT '0',
  `failed_records` int unsigned DEFAULT '0',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_type` (`job_type`),
  KEY `idx_jobs_status` (`status`),
  KEY `idx_jobs_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_processing_jobs`
--

LOCK TABLES `data_processing_jobs` WRITE;
/*!40000 ALTER TABLE `data_processing_jobs` DISABLE KEYS */;
INSERT INTO `data_processing_jobs` VALUES (1,'TEAM_SYNC','COMPLETED','2025-08-12 16:03:15','2025-08-12 16:03:16',32,32,0,NULL,'{\"source\": \"cli:teams\"}','2025-08-12 16:03:15','2025-08-12 11:03:15'),(2,'PLAYER_SYNC','COMPLETED','2025-08-12 16:03:46','2025-08-12 16:03:46',NULL,0,0,NULL,'{\"team\": \"kc\", \"source\": \"cli:roster\"}','2025-08-12 16:03:46','2025-08-12 11:03:46'),(3,'PLAYER_SYNC','COMPLETED','2025-08-12 16:04:05','2025-08-12 16:04:07',NULL,0,0,NULL,'{\"source\": \"cli:rosters:all\", \"concurrency\": 4}','2025-08-12 16:04:05','2025-08-12 11:04:07'),(4,'TEAM_SYNC','COMPLETED','2025-08-12 16:11:54','2025-08-12 16:11:55',32,32,0,NULL,'{\"source\": \"api:kickoff/teams\"}','2025-08-12 16:11:54','2025-08-12 11:11:54'),(5,'TEAM_SYNC','COMPLETED','2025-08-13 02:32:24','2025-08-13 02:32:25',NULL,32,0,NULL,'{\"source\": \"cli\"}','2025-08-13 02:32:24','2025-08-13 02:32:25'),(6,'TEAM_SYNC','COMPLETED','2025-08-13 02:46:57','2025-08-13 02:46:57',NULL,32,0,NULL,'{\"source\": \"cli\"}','2025-08-13 02:46:57','2025-08-13 02:46:57'),(7,'PLAYER_SYNC','COMPLETED','2025-08-13 02:47:01','2025-08-13 02:47:02',NULL,0,0,NULL,'{\"team\": \"kc\", \"source\": \"cli\"}','2025-08-13 02:47:01','2025-08-13 02:47:02'),(8,'PLAYER_SYNC','COMPLETED','2025-08-13 02:47:06','2025-08-13 02:47:10',NULL,0,0,NULL,'{\"kind\": \"all\", \"source\": \"cli\"}','2025-08-13 02:47:06','2025-08-13 02:47:10'),(9,'PLAYER_SYNC','COMPLETED','2025-08-14 04:36:13','2025-08-14 04:36:14',NULL,0,0,NULL,'{\"team\": \"kc\", \"source\": \"api\"}','2025-08-14 04:36:10','2025-08-14 04:36:14'),(10,'TEAM_SYNC','COMPLETED','2025-08-14 04:36:17','2025-08-14 04:36:18',NULL,32,0,NULL,'{\"source\": \"api\"}','2025-08-14 04:36:14','2025-08-14 04:36:18'),(11,'ENRICHMENT','COMPLETED','2025-08-15 10:00:00','2025-08-15 10:00:01',11,0,11,NULL,'{\"date\": \"20250816\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-15 10:00:00','2025-08-15 10:00:01'),(12,'ENRICHMENT','COMPLETED','2025-08-16 10:00:00','2025-08-16 10:00:01',2,0,2,NULL,'{\"date\": \"20250817\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-16 10:00:00','2025-08-16 10:00:01'),(13,'ENRICHMENT','COMPLETED','2025-08-17 10:00:00','2025-08-17 10:00:00',1,0,1,NULL,'{\"date\": \"20250818\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-17 10:00:00','2025-08-17 10:00:00'),(14,'ENRICHMENT','COMPLETED','2025-08-20 10:00:00','2025-08-20 10:00:00',2,0,2,NULL,'{\"date\": \"20250821\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-20 10:00:00','2025-08-20 10:00:00'),(15,'ENRICHMENT','COMPLETED','2025-08-22 10:00:00','2025-08-22 10:00:00',10,0,10,NULL,'{\"date\": \"20250823\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-22 10:00:00','2025-08-22 10:00:00'),(16,'ENRICHMENT','COMPLETED','2025-08-23 10:00:00','2025-08-23 10:00:00',0,0,0,NULL,'{\"date\": \"20250824\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-23 10:00:00','2025-08-23 10:00:00'),(17,'ENRICHMENT','COMPLETED','2025-08-24 10:00:00','2025-08-24 10:00:00',0,0,0,NULL,'{\"date\": \"20250825\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-24 10:00:00','2025-08-24 10:00:00'),(18,'ENRICHMENT','COMPLETED','2025-08-27 10:00:00','2025-08-27 10:00:00',0,0,0,NULL,'{\"date\": \"20250828\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-08-27 10:00:00','2025-08-27 10:00:00'),(19,'TEAM_SYNC','COMPLETED','2025-09-28 03:29:10','2025-09-28 03:29:11',NULL,32,0,NULL,'{\"source\": \"api\"}','2025-09-28 03:29:07','2025-09-28 03:29:11'),(20,'PLAYER_SYNC','COMPLETED','2025-09-28 03:34:02','2025-09-28 03:34:03',NULL,0,0,NULL,'{\"team\": \"kc\", \"source\": \"api\"}','2025-09-28 03:33:59','2025-09-28 03:34:03'),(21,'TEAM_SYNC','COMPLETED','2025-09-28 03:34:18','2025-09-28 03:34:19',NULL,32,0,NULL,'{\"source\": \"api\"}','2025-09-28 03:34:15','2025-09-28 03:34:19'),(22,'PLAYER_SYNC','COMPLETED','2025-09-28 09:53:35','2025-09-28 09:53:36',NULL,0,0,NULL,'{\"team\": \"kc\", \"source\": \"api\"}','2025-09-28 09:53:32','2025-09-28 09:53:36'),(23,'TEAM_SYNC','COMPLETED','2025-09-28 09:53:52','2025-09-28 09:53:53',NULL,32,0,NULL,'{\"source\": \"api\"}','2025-09-28 09:53:49','2025-09-28 09:53:53'),(24,'TEAM_SYNC','COMPLETED','2025-09-28 09:54:32','2025-09-28 09:54:33',NULL,32,0,NULL,'{\"source\": \"api\"}','2025-09-28 09:54:29','2025-09-28 09:54:33'),(25,'ENRICHMENT','COMPLETED','2025-09-28 10:00:00','2025-09-28 10:00:00',2,0,2,NULL,'{\"date\": \"20250929\", \"mode\": \"cron\", \"source\": \"espn.scoreboard\"}','2025-09-28 10:00:00','2025-09-28 10:00:00'),(26,'TEAM_SYNC','COMPLETED','2025-09-29 00:30:27','2025-09-29 00:30:27',NULL,32,0,NULL,'{\"source\": \"api\"}','2025-09-29 00:30:24','2025-09-29 00:30:27'),(27,'PLAYER_SYNC','COMPLETED','2025-09-29 00:30:55','2025-09-29 00:30:55',NULL,0,0,NULL,'{\"team\": \"kc\", \"source\": \"api\"}','2025-09-29 00:30:52','2025-09-29 00:30:55'),(28,'TEAM_SYNC','COMPLETED','2025-09-29 00:31:06','2025-09-29 00:31:07',NULL,32,0,NULL,'{\"source\": \"api\"}','2025-09-29 00:31:03','2025-09-29 00:31:07');
/*!40000 ALTER TABLE `data_processing_jobs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-16 12:40:04
