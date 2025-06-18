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
-- Table structure for table `Team`
--

DROP TABLE IF EXISTS `Team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Team` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `conference` varchar(35) DEFAULT NULL,
  `division` varchar(20) DEFAULT NULL,
  `stadium` varchar(45) DEFAULT NULL,
  `scheduleId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Team`
--

LOCK TABLES `Team` WRITE;
/*!40000 ALTER TABLE `Team` DISABLE KEYS */;
INSERT INTO `Team` VALUES (61,'Arizona Cardinals','Tempe','AZ','NFC','West','State Farm Stadium',0),(62,'Atlanta Falcons','Atlanta','GA','NFC','South','Mercedes-Benz Stadium',0),(63,'Baltimore Ravens','Baltimore','MD','AFC','AFC North','M&T Bank Stadium',NULL),(65,'Buffalo Bills','Orchard Park','NY','AFC','AFC East','Highmark Stadium',NULL),(66,'Carolina Panthers','Charlotte','SC','NFC','NFC South','Bank Of America Stadium',NULL),(67,'Chicago Bears','Chicago','IL','NFC','NFC North','Soldier Field',NULL),(68,'Cincinnati Bengals','Cincinnati','OH','AFC','AFC North','Paycor Stadium',NULL),(69,'Cleveland Browns','Cleveland','OH','AFC','AFC North','Cleveland Browns Stadium',NULL),(70,'Dallas Cowboys','Dallas','TX','NFC','NFC East','AT&T Stadium',NULL),(71,'Detroit Lions','Detroit','MI','NFC','NFC North','Ford Field Stadium',NULL),(72,'Denver Broncos','Denver','CO','AFC','AFC West','Empower Field at Mile High',NULL),(73,'Green Bay Packers','Green Bay','WI','NFC','NFC North','Lambeau Field Stadium',NULL),(75,'Indianapolis Colts','Indianapolis','IN','AFC','AFC South','Locus Oil Stadium',NULL),(76,'Jacksonville Jaguars','Jacksonville','FL','AFC','AFC South','TIAA Bank Field Stadium',NULL),(77,'Los Angeles Rams','Inglewood','CA','NFC','NFC West','Sofi Stadium',NULL),(78,'Kansas City Chiefs','Kansas City','MO','AFC','AFC West','GEHA Field at Arrowhead Stadium',NULL),(79,'Las Vegas Raiders','Las Vages','NV','AFC','AFC West','Allegiant Stadium',NULL),(80,'Minnesota Vikings','Minneapolis','MN','NFC','NFC North','U.S. Bank Stadium',NULL),(82,'New York Giants','East Rutherford','NY','NFC','NFC East','Metlife Stadium',NULL),(83,'New York Jet','East Rutherford','New Jersey','AFC','AFC East','Lincoln Financial Field',NULL),(84,'Philadelphia Eagles','Philedelphia','PA','NFC','NFC East','Lincoln Financial Field',NULL),(85,'Pittsburgh Steelers','Pittsburgh','PA','AFC','AFC North','Acrisure Stadium',NULL),(86,'San Franscisco','Santa Clara','CA','NFC','NFC West','Levi\'s Stadium',NULL),(87,'Seattle Seahawks','Seattle','WA','NFC','NFC West','Lumen Field',NULL),(88,'Tampa Bay Buccaneers','Tampa','FL','NFC','NFC South','Raymond James Stadium',NULL),(89,'Tennessee Titans','Nashville','TN','AFC','AFC South','Nissan Stadium',NULL),(90,'Washington Commanders','Landover','MD','NFC','NFC East','FedExField',NULL),(92,'New Orleans Saints','New Orleans','Lousianna','NFC','South','Caesars Superdome',1);
/*!40000 ALTER TABLE `Team` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-18 10:38:53
