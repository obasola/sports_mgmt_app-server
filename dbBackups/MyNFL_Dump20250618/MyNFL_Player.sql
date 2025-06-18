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
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `handSize` float DEFAULT NULL,
  `armLength` float DEFAULT NULL,
  `homeCity` varchar(45) DEFAULT NULL,
  `homeState` varchar(45) DEFAULT NULL,
  `university` varchar(75) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `position` varchar(75) DEFAULT NULL,
  `pickId` int DEFAULT NULL,
  `combineScoreId` int DEFAULT NULL,
  `prospectId` int DEFAULT NULL,
  `yearEnteredLeague` year DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Player_Prospect` (`prospectId`),
  CONSTRAINT `fk_Player_Prospect` FOREIGN KEY (`prospectId`) REFERENCES `Prospect` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=392 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Player`
--

LOCK TABLES `Player` WRITE;
/*!40000 ALTER TABLE `Player` DISABLE KEYS */;
INSERT INTO `Player` VALUES (19,'Patrick','Mahomes',28,6.1,200,NULL,NULL,NULL,NULL,'Texas Tech',NULL,'QB',NULL,NULL,NULL,NULL),(22,'Xavier','Worthy',21,5.11,200,NULL,NULL,NULL,NULL,'University of Texas',NULL,'WR',NULL,NULL,NULL,NULL),(25,'Skyy','Moore',23,510,0,10,0,'','','Michigan State',NULL,'WR',NULL,NULL,NULL,NULL),(26,'Mecole','Hardman',28,510,0,10,0,'','','LSU',NULL,'WR',NULL,NULL,NULL,NULL),(27,'Tyreek','Hill',30,510,190,95,31,'','','Texas A&M',NULL,'WR',NULL,NULL,NULL,NULL),(28,'Chris','Jones',30,66,310,10,36,'','','Mississippi State',NULL,'DE',NULL,NULL,NULL,NULL),(45,'Kelvin','Banks Jr.',22,6.1,200,NULL,NULL,NULL,NULL,'Texas',NULL,'OT',NULL,NULL,NULL,NULL),(391,'Tai','Felton',22,6011,185,NULL,NULL,NULL,NULL,'Maryland',NULL,'WR',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `Player` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-18 10:38:52
