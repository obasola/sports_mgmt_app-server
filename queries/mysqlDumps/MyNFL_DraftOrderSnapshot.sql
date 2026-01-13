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
-- Table structure for table `DraftOrderSnapshot`
--

DROP TABLE IF EXISTS `DraftOrderSnapshot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DraftOrderSnapshot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mode` enum('current','projection') NOT NULL,
  `strategy` varchar(64) DEFAULT NULL,
  `seasonYear` varchar(4) NOT NULL,
  `seasonType` tinyint unsigned NOT NULL,
  `throughWeek` tinyint unsigned DEFAULT NULL,
  `source` varchar(32) NOT NULL DEFAULT 'internal',
  `inputHash` char(64) NOT NULL,
  `computedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `jobId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_draftordersnapshot_mode_strategy_season_week_hash` (`mode`,`strategy`,`seasonYear`,`seasonType`,`throughWeek`,`inputHash`),
  KEY `ix_draftordersnapshot_lookup` (`mode`,`strategy`,`seasonYear`,`seasonType`,`throughWeek`,`computedAt`),
  KEY `ix_draftordersnapshot_job` (`jobId`),
  CONSTRAINT `fk_draftordersnapshot_job` FOREIGN KEY (`jobId`) REFERENCES `Job` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DraftOrderSnapshot`
--

LOCK TABLES `DraftOrderSnapshot` WRITE;
/*!40000 ALTER TABLE `DraftOrderSnapshot` DISABLE KEYS */;
INSERT INTO `DraftOrderSnapshot` VALUES (5,'current',NULL,'2025',2,18,'internal','24c7ee9ff0fa19be5d2116adaaaa60c0f66c683c697c8c491518f25f56db2f10','2026-01-03 23:52:05.405',NULL),(6,'current',NULL,'2025',2,2,'internal','1cf174150f0b95ca1a2996ac73d09c6b3119969dc05676c8f1531c9ab2f0768a','2026-01-04 00:25:36.459',NULL),(7,'current',NULL,'2025',2,18,'internal','8333ceeb4013e6cad4f8162c2a7cfcd0ff3e83df7fe640fc13c70c9c52d978f6','2026-01-05 19:45:49.385',NULL),(8,'projection','baseline','2025',2,18,'internal','3fd91b59057de2a0ddd74f77849e1d2698456a611fe65ba72725c72695356b1d','2026-01-05 19:46:19.300',NULL),(9,'current',NULL,'2025',2,18,'internal','8333ceeb4013e6cad4f8162c2a7cfcd0ff3e83df7fe640fc13c70c9c52d978f6','2026-01-05 19:46:40.287',NULL),(11,'current',NULL,'2025',2,18,'internal','8333ceeb4013e6cad4f8162c2a7cfcd0ff3e83df7fe640fc13c70c9c52d978f6','2026-01-05 19:49:01.483',NULL),(13,'current',NULL,'2025',2,18,'internal','8333ceeb4013e6cad4f8162c2a7cfcd0ff3e83df7fe640fc13c70c9c52d978f6','2026-01-05 23:44:39.233',NULL),(14,'projection','baseline','2025',2,18,'internal','635a4a43b6219447952152aeb407bcf7d014395356134220238c4d21d5f0dc2d','2026-01-06 17:09:53.990',NULL),(15,'current',NULL,'2025',2,18,'internal','369f258399351cac0669fd69281973aa93b1b680565cade6237dee34f9e9ee29','2026-01-06 17:11:46.535',NULL),(16,'current',NULL,'2025',2,18,'internal','369f258399351cac0669fd69281973aa93b1b680565cade6237dee34f9e9ee29','2026-01-06 21:51:11.776',NULL),(17,'current',NULL,'2025',2,18,'internal','369f258399351cac0669fd69281973aa93b1b680565cade6237dee34f9e9ee29','2026-01-06 23:28:30.707',NULL),(18,'current',NULL,'2025',2,18,'internal','369f258399351cac0669fd69281973aa93b1b680565cade6237dee34f9e9ee29','2026-01-06 23:38:02.220',NULL);
/*!40000 ALTER TABLE `DraftOrderSnapshot` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-13 15:54:04
