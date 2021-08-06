package jobs

import com.gu.Box
import common.GuLogging
import conf.cricketPa.{CricketFeedException, CricketTeam, CricketTeams, PaFeed}
import cricketModel.Match
import org.joda.time.DateTime

import java.time.{Duration, Instant, LocalDate, LocalDateTime, ZoneId}
import java.text.SimpleDateFormat
import java.util.{Date, TimeZone}
import scala.concurrent.{ExecutionContext, Future}

class CricketStatsJob(paFeed: PaFeed) extends GuLogging {

  private val cricketStatsAgents = CricketTeams.teams.map(Team => (Team, Box[Map[String, Match]](Map.empty)))

  private val dateFormatUTC = new SimpleDateFormat("yyyy/MMM/dd")
  dateFormatUTC.setTimeZone(TimeZone.getTimeZone("Europe/London"))

  private def toLocalDate(date: Date): LocalDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
  private def dateTimeToLocalDateTime(date: DateTime): LocalDateTime = {
    LocalDateTime.ofInstant(
      Instant.ofEpochMilli(
        date
          .toInstant()
          .getMillis,
      ),
      ZoneId.systemDefault,
    )
  }

  def getMatch(team: CricketTeam, date: String): Option[Match] =
    cricketStatsAgents
      .find(_._1 == team)
      .flatMap { case (_, agent) => agent().get(date) }

  def findMatch(team: CricketTeam, date: String): Option[Match] = {
    val dateFormat = PaFeed.dateFormat
    val requestDate = dateFormat.parse(date)

    val matchObjects = for {
      day <- 0 until 6 // normally test matches are 5 days but we have seen at least 6 days in practice
      date <- Some(dateFormat.format(toLocalDate(requestDate).minusDays(day)))
    } yield {
      getMatch(team, date)
    }
    matchObjects.flatten.headOption
  }

  def run(fromDate: LocalDate, matchesToFetch: Int)(implicit executionContext: ExecutionContext): Unit = {

    cricketStatsAgents.foreach {
      case (team, agent) =>
        // Find new ids which are not in the stats agent. Caveat: always include live matches to update.
        val loadedMatches = agent().values
          .filter(cricketMatch =>
            // Omit any recent match within the last 5 days, to account for test matches.
            Duration.between(cricketMatch.gameDate, LocalDate.now).toDays() > 5,
          )
          .map(_.matchId)
          .toSeq

        paFeed
          .getMatchIds(team, fromDate)
          .map { matchIds =>
            // never fetch more than 10 matches
            val matches = matchIds.diff(loadedMatches).take(Math.min(matchesToFetch, 10))

            matches.map { matchId =>
              paFeed
                .getMatch(matchId)
                .map { matchData =>
                  val date = PaFeed.dateFormat.format(matchData.gameDate)
                  log.info(s"Updating cricket match: ${matchData.homeTeam.name} v ${matchData.awayTeam.name}, $date")
                  agent.send(_ + (date -> matchData))
                }
                .recover {
                  case paFeedError: CricketFeedException =>
                    log.warn(s"CricketStatsJob encountered errors: ${paFeedError.message}")
                  case error: Exception => log.warn(error.getMessage)
                }
            }
          }
          .recover {
            case paFeedError: CricketFeedException =>
              log.warn(s"CricketStatsJob couldn't find matches: ${paFeedError.message}")
            case error: Exception => log.warn(error.getMessage)
          }
    }
  }
}
