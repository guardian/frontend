package model
import pa._
import common.{ Logging, AkkaSupport }
import conf.ContentApi
import akka.util.Duration
import java.util.concurrent.TimeUnit._
import com.gu.openplatform.contentapi.model.TagsResponse
import scala.Some
import akka.actor.Cancellable

case class Team(team: FootballTeam, tag: Option[Tag], shortName: Option[String]) {
  lazy val url = tag.map(_.url)
  lazy val name = shortName.getOrElse(team.name)
  lazy val id = team.id
}

object TeamMap extends AkkaSupport with Logging {

  val teamAgent = play_akka.agent(Map.empty[String, Tag])

  private var schedule: Option[Cancellable] = None

  // teamId -> manually curated short name
  val shortNames = Map(
    "19" -> "Spurs",
    "5" -> "Crystal Palace",
    "30" -> "Middlesbrough",
    "84" -> "Peterborough",
    "44" -> "Wolverhampton",
    "20" -> "Milton Keynes Dons",
    "74" -> "Colchester",
    "188" -> "Crawley Town",
    "45987" -> "AFC Wimbledon",
    "24" -> "Bradford",
    "11899" -> "Fleetwood Town",
    "1204" -> "Accrington Stanley",
    "184" -> "Burton Albion",
    "49567" -> "AFC Telford",
    "1205" -> "Alfreton Town",
    "9262" -> "Braintree Town",
    "71" -> "Cambridge Utd",
    "7813" -> "Ebbsfleet United",
    "82" -> "Lincoln City",
    "19337" -> "Newport County",
    "89" -> "Stockport County",
    "1456" -> "Inverness CT",
    "95" -> "Dundee",
    "45938" -> "Airdrie Utd",
    "103" -> "Albion",
    "125" -> "Queen of South",
    "17635" -> "Annan Athletic",
    "128" -> "Stirling",
    "208" -> "Gainsborough",
    "13730" -> "Bradford P A",
    "10186" -> "Hinckley Utd",
    "13732" -> "Harrogate Town",
    "79" -> "FC Halifax",
    "136" -> "Boston Utd",
    "53" -> "Chester FC",
    "884" -> "Colwyn Bay",
    "473" -> "Solihull Moors",
    "24612" -> "Vauxhall Motors",
    "10883" -> "Truro City",
    "55986" -> "Hayes & Yeading",
    "150" -> "Sutton Utd",
    "10202" -> "Tonbridge Angels",
    "7808" -> "Bath City",
    "11667" -> "Farnborough",
    "12671" -> "Staines Town",
    "23510" -> "Havant and W",
    "13754" -> "Eastbourne Borough",
    "12679" -> "Maidenhead Utd",
    "51830" -> "AFC Hornchurch",
    "32166" -> "Dinamo Zagreb",
    "26264" -> "FC Porto",
    "26249" -> "Schalke 04",
    "38276" -> "Zenit St Petersburg",
    "26261" -> "Borussia Dortmund",
    "38299" -> "Shakhtar Donetsk",
    "43136" -> "FC Nordsjaelland",
    "26247" -> "Bayern Munich",
    "6997" -> "Spartak Moscow",
    "49647" -> "CFR Cluj-Napoca",
    "26451" -> "Galatasaray",
    "26269" -> "Braga",
    "42007" -> "Anzhi Makhachkala",
    "35999" -> "Hapoel Tel-Aviv",
    "26305" -> "Atletico Madrid",
    "38336" -> "Plzen",
    "26259" -> "Borussia M'gladbach",
    "26250" -> "VfB Stuttgart",
    "6901" -> "Steaua Bucuresti",
    "26412" -> "FC Copenhagen",
    "38429" -> "Videoton FC",
    "26268" -> "Sporting",
    "6136" -> "Inter Milan",
    "6935" -> "Partizan Belgrade",
    "56055" -> "Hapoel Kiryat Shmona",
    "26313" -> "Athletic Bilbao",
    "38302" -> "FC Metalist Kharkiv",
    "26256" -> "Bayer Leverkusen",
    "32309" -> "Hannover 96",
    "7520" -> "Helsingborgs IF",
    "26322" -> "FC Twente"
  )

  def apply(team: FootballTeam) = Team(team, teamAgent().get(team.id), shortNames.get(team.id))

  def findTeamIdByUrlName(name: String): Option[String] = teamAgent().find(_._2.id == ("football/" + name)).map(_._1)

  def startup() {
    schedule = Some(play_akka.scheduler.every(Duration(1, MINUTES), initialDelay = Duration(5, SECONDS)) {
      incrementalRefresh(1) //pages are 1 based
    })
  }

  def shutdown() { schedule.foreach(_.cancel()) }

  private def incrementalRefresh(page: Int) {
    log.info("Refreshing team tag mappings - page " + page)
    teamAgent.sendOff { old =>
      val response: TagsResponse = ContentApi.tags
        .page(page)
        .pageSize(50)
        .referenceType("pa-football-team")
        .showReferences("pa-football-team")
        .response

      if (response.pages > page) {
        incrementalRefresh(page + 1)
      }

      val tagReferences = response.results.map { tag => (tag.references.head.id.split("/")(1), Tag(tag)) }.toMap
      old ++ tagReferences
    }
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
        "/football/match/%s/%s-v-%s".format(
          theMatch.date.toString("yyyy/MMM/dd").toLowerCase,
          homeTeam.replace("/football/", ""),
          awayTeam.replace("/football/", "")
        )
      case _ => "/football/match/%s".format(theMatch.id)
    }
  }
}