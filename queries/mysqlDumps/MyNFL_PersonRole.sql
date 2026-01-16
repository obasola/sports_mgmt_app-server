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
-- Table structure for table `PersonRole`
--

DROP TABLE IF EXISTS `PersonRole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PersonRole` (
  `id` int NOT NULL AUTO_INCREMENT,
  `personId` int NOT NULL,
  `roleId` int NOT NULL,
  `assignedByPersonId` int DEFAULT NULL,
  `assignedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revokedAt` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_person_role` (`personId`,`roleId`),
  KEY `fk_personrole_role` (`roleId`),
  KEY `fk_personrole_assignedby` (`assignedByPersonId`),
  CONSTRAINT `fk_personrole_assignedby` FOREIGN KEY (`assignedByPersonId`) REFERENCES `Person` (`pid`),
  CONSTRAINT `fk_personrole_person` FOREIGN KEY (`personId`) REFERENCES `Person` (`pid`),
  CONSTRAINT `fk_personrole_role` FOREIGN KEY (`roleId`) REFERENCES `Roles` (`rid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PersonRole`
--

LOCK TABLES `PersonRole` WRITE;
/*!40000 ALTER TABLE `PersonRole` DISABLE KEYS */;
INSERT INTO `PersonRole` VALUES (1,6,1,6,'2026-01-12 05:11:07',NULL,1),(2,6,2,6,'2026-01-12 05:13:16',NULL,1),(3,6,3,6,'2026-01-12 05:14:29',NULL,1),(4,6,4,6,'2026-01-12 05:15:22',NULL,1);
/*!40000 ALTER TABLE `PersonRole` ENABLE KEYS */;
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
