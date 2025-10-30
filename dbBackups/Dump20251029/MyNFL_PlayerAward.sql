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
-- Table structure for table `PlayerAward`
--

DROP TABLE IF EXISTS `PlayerAward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlayerAward` (
  `id` int NOT NULL AUTO_INCREMENT,
  `playerId` int NOT NULL,
  `awardName` varchar(45) DEFAULT NULL,
  `yearAwarded` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_Player_Awards_idx` (`playerId`),
  CONSTRAINT `FK_Player_Awards` FOREIGN KEY (`playerId`) REFERENCES `Player` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PlayerAward`
--

LOCK TABLES `PlayerAward` WRITE;
/*!40000 ALTER TABLE `PlayerAward` DISABLE KEYS */;
INSERT INTO `PlayerAward` VALUES (1,19,'Regular Season MVP',2019),(2,19,'SuperBowl MVP',2021),(3,19,'Regular Season MVP',2023),(4,19,'SuperBowl MVP',2023),(5,19,'Best NFL Player ESPY Award',2019),(6,19,'Best NFL Player ESPY Award',2023),(7,19,'AP Most Valuable Player',2018),(8,19,'AP Most Valuable Player',2019),(9,19,'AP Most Valuable Player',2023),(10,27,NULL,NULL),(11,27,NULL,NULL),(12,27,NULL,NULL);
/*!40000 ALTER TABLE `PlayerAward` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 22:45:41
