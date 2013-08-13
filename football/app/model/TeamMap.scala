package model

import common._
import conf.ContentApi
import pa._


case class Team(team: FootballTeam, tag: Option[Tag], shortName: Option[String]) extends FootballTeam {
  lazy val url = tag.map(_.url)
  override lazy val name = shortName.getOrElse(team.name)
  override lazy val id = team.id
}

object TeamMap extends ExecutionContexts with Logging {

  val teamAgent = AkkaAgent(Map.empty[String, Tag])

  // teamId -> manually curated short name
  val shortNames = Map(
    ("19", "Spurs"),
    ("5", "C Palace"),
    ("30", "Middlesboro"),
    ("84", "Peterboro"),
    ("44", "Wolves"),
    ("20", "MK Dons"),
    ("74", "Colchester"),
    ("188", "Crawley"),
    ("45987", "Wimbledon"),
    ("24", "Bradford City"),
    ("11899", "Fleetwood"),
    ("1204", "Accrington"),
    ("184", "Burton A"),
    ("49567", "Telford"),
    ("1205", "Alfreton"),
    ("71", "Cambridge"),
    ("7813", "Ebbsfleet"),
    ("82", "Lincoln"),
    ("19337", "Newport"),
    ("9262", "Braintree"),
    ("89", "Stockport"),
    ("1456", "Inverness"),
    ("96", "Dundee Utd"),
    ("45938", "Airdrie"),
    ("125", "QOS FC"),
    ("17635", "Annan"),
    ("128", "East Stirling"),
    ("13732", "Harrogate"),
    ("79", "Halifax"),
    ("136", "Boston"),
    ("208", "Gainsboro"),
    ("53", "Chester"),
    ("13730", "Bradford PA"),
    ("884", "Colwyn"),
    ("10186", "Hinckley"),
    ("473", "Solihull"),
    ("24612", "Vauxhall"),
    ("10883", "Truro"),
    ("10202", "Tonbridge"),
    ("7808", "Bath"),
    ("150", "Sutton"),
    ("12671", "Staines"),
    ("23510", "Havant"),
    ("13754", "Eastbourne"),
    ("12679", "Maidenhead"),
    ("55986", "Hayes"),
    ("51830", "Hornchurch"),
    ("32166", "D Zagreb"),
    ("26264", "Porto"),
    ("26249", "Schalke"),
    ("38276", "Zenit"),
    ("26261", "Dortmund"),
    ("38299", "Shakhtar"),
    ("43136", "Nordsjaelland"),
    ("26247", "Bayern"),
    ("6997", "Spartak"),
    ("49647", "CFR Cluj"),
    ("26451", "Galatasaray"),
    ("26269", "SC Braga"),
    ("42007", "Anzhi"),
    ("35999", "Hapoel"),
    ("26305", "Atlético"),
    ("38336", "Viktoria"),
    ("26259", "M'gladbach"),
    ("26250", "Stuttgart"),
    ("6901", "Steaua"),
    ("26412", "Copenhagen"),
    ("38429", "Videoton"),
    ("26268", "Gijón"),
    ("6136", "Inter"),
    ("6935", "Partizan"),
    ("56055", "H Kiryat Shmona"),
    ("26313", "A Bilbao"),
    ("38302", "FC Metalist"),
    ("26256", "Leverkusen"),
    ("32309", "Hannover"),
    ("7520", "Helsingborg"),
    ("26322", "Twente"),
    ("26398", "Basel")
  )

  def apply(team: FootballTeam) = Team(team, teamAgent().get(team.id), shortNames.get(team.id))

  def findTeamIdByUrlName(name: String): Option[String] = teamAgent().find(_._2.id == s"football/$name").map(_._1)

  def findUrlNameFor(teamId: String): Option[String] = teamAgent().get(teamId).map(_.url.replace("/football/", ""))

  def refresh(page: Int = 1) { //pages are 1 based
    log.info(s"Refreshing team tag mappings - page $page")
    ContentApi.tags
      .page(page)
      .pageSize(50)
      .referenceType("pa-football-team")
      .showReferences("pa-football-team")
      .response.foreach{ response =>
      if (response.pages > page) {
        refresh(page + 1)
      }

      val tagReferences = response.results.map { tag => (tag.references.head.id.split("/")(1), Tag(tag)) }.toMap
      teamAgent.send(old => old ++ tagReferences)
    }
  }

  def stop() {
    teamAgent.close()
  }
}

object TeamUrl {
  def apply(team: FootballTeam): Option[String] = TeamMap(team).url
}

object TeamName {
  def apply(team: FootballTeam) = {
    TeamMap.shortNames.get(team.id).getOrElse(team.name)
  }
}

// if we have tags for the matches we can make a sensible url for it
object MatchUrl {
  def apply(theMatch: FootballMatch): String = {
    val home = TeamMap(theMatch.homeTeam).tag.flatMap(_.url)
    val away = TeamMap(theMatch.awayTeam).tag.flatMap(_.url)
    (home, away) match {
      case (Some(homeTeam), Some(awayTeam)) =>
        s"/football/match/${theMatch.date.toString("yyyy/MMM/dd").toLowerCase}/${homeTeam.replace("/football/", "")}-v-${awayTeam.replace("/football/", "")}"
      case _ => s"/football/match/${theMatch.id}"
    }
  }
}
