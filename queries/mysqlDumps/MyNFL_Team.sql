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
  `abbreviation` varchar(255) DEFAULT NULL,
  `espnTeamId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_team_name` (`name`),
  UNIQUE KEY `abbreviation` (`abbreviation`),
  UNIQUE KEY `espnTeamId` (`espnTeamId`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Team`
--

LOCK TABLES `Team` WRITE;
/*!40000 ALTER TABLE `Team` DISABLE KEYS */;
INSERT INTO `Team` VALUES (61,'Arizona Cardinals','Tempe','AZ','NFC','West','State Farm Stadium',0,'ARI',22),(62,'Atlanta Falcons','Atlanta','GA','NFC','South','Mercedes-Benz Stadium',0,'ATL',1),(63,'Baltimore Ravens','Baltimore','MD','AFC','North','M&T Bank Stadium',NULL,'BAL',33),(65,'Buffalo Bills','Orchard Park','NY','AFC','East','Highmark Stadium',NULL,'BUF',2),(66,'Carolina Panthers','Charlotte','SC','NFC','South','Bank Of America Stadium',NULL,'CAR',29),(67,'Chicago Bears','Chicago','IL','NFC','North','Soldier Field',NULL,'CHI',3),(68,'Cincinnati Bengals','Cincinnati','OH','AFC','North','Paycor Stadium',NULL,'CIN',4),(69,'Cleveland Browns','Cleveland','OH','AFC','North','Cleveland Browns Stadium',NULL,'CLE',5),(70,'Dallas Cowboys','Dallas','TX','NFC','East','AT&T Stadium',NULL,'DAL',6),(71,'Detroit Lions','Detroit','MI','NFC','North','Ford Field Stadium',NULL,'DET',8),(72,'Denver Broncos','Denver','CO','AFC','West','Empower Field at Mile High',NULL,'DEN',7),(73,'Green Bay Packers','Green Bay','WI','NFC','North','Lambeau Field Stadium',NULL,'GB',9),(75,'Indianapolis Colts','Indianapolis','IN','AFC','South','Locus Oil Stadium',NULL,'IND',11),(76,'Jacksonville Jaguars','Jacksonville','FL','AFC','South','TIAA Bank Field Stadium',NULL,'JAX',30),(77,'Los Angeles Rams','Inglewood','CA','NFC','West','Sofi Stadium',NULL,'LAR',14),(78,'Kansas City Chiefs','Kansas City','MO','AFC','West','GEHA Field at Arrowhead Stadium',NULL,'KC',12),(79,'Las Vegas Raiders','Las Vages','NV','AFC','West','Allegiant Stadium',NULL,'LV',13),(80,'Minnesota Vikings','Minneapolis','MN','NFC','North','U.S. Bank Stadium',NULL,'MIN',16),(82,'New York Giants','East Rutherford','NY','NFC','East','Metlife Stadium',NULL,'NYG',19),(83,'New York Jets','East Rutherford','NJ','AFC','East','Lincoln Financial Field',NULL,'NYJ',20),(84,'Philadelphia Eagles','Philedelphia','PA','NFC','East','Lincoln Financial Field',NULL,'PHI',21),(85,'Pittsburgh Steelers','Pittsburgh','PA','AFC','North','Acrisure Stadium',NULL,'PIT',23),(86,'San Francisco 49ers','Santa Clara','CA','NFC','West','Levi\'s Stadium',NULL,'SF',25),(87,'Seattle Seahawks','Seattle','WA','NFC','West','Lumen Field',NULL,'SEA',26),(88,'Tampa Bay Buccaneers','Tampa','FL','NFC','South','Raymond James Stadium',NULL,'TB',27),(89,'Tennessee Titans','Nashville','TN','AFC','South','Nissan Stadium',NULL,'TEN',10),(90,'Washington Commanders','Landover','MD','NFC','East','FedExField',NULL,'WSH',28),(92,'New Orleans Saints','New Orleans','LA','NFC','South','Caesars Superdome',1,'NO',18),(93,'Houston Texans','Houston','TX','AFC','South','NRG Stadium',NULL,'HOU',34),(94,'Miami Dolphins','Miami Gardens','FL','AFC','East','Hard Rock Stadium',NULL,'MIA',15),(95,'New England Patriots','Foxborough','MA','AFC','East','Gillette Stadium',NULL,'NE',17),(96,'Los Angeles Chargers','Los Angeles','CA','AFC','West','SoFi Stadium',NULL,'LAC',24);
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

-- Dump completed on 2026-01-13 15:54:04
