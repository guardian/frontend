package rugby.feed

import common.{Edition, Logging, ExecutionContexts}
import conf.LiveContentApi
import model.Content
import org.joda.time.DateTimeZone
import rugby.jobs.RugbyStatsJob
import rugby.model.Match

import scala.concurrent.Future

case class MatchNavigation(
  matchReport: Content,
  minByMin: Content
)

object CapiFeed extends ExecutionContexts with Logging {

  def getMatchArticles() : Future[Map[String, MatchNavigation]] = {
    Future.sequence(
      RugbyStatsJob.getAllResults().map { rugbyMatch =>
        loadNavigation(rugbyMatch).map( _.map( (rugbyMatch.key, _) ) )
      }
    ).map(_.flatten.toMap)
  }

  def findMatchArticle(rugbyMatch: Match) : Option[MatchNavigation] = {
    RugbyStatsJob.getMatchNavContent(rugbyMatch)
  }

  private def loadNavigation(rugbyMatch: Match): Future[Option[MatchNavigation]] = {
    val matchDate = rugbyMatch.date.toLocalDate
    val teamTags = rugbyMatch.teamTags.mkString(",")
    val searchTags = s"(tone/matchreports,sport/rugby-union,$teamTags) | (tone/minutebyminute,sport/rugby-union,$teamTags)"

    log.info(s"Looking for ${rugbyMatch.toString}")

    LiveContentApi.getResponse(LiveContentApi.search(Edition.defaultEdition)
      .section("sport")
      .tag(searchTags)
      .fromDate(matchDate.toDateTimeAtStartOfDay)
      .toDate(matchDate.plusDays(2).toDateTimeAtStartOfDay)
    ).flatMap { response =>
        val navContent = response.results.map(Content(_)).filter(_.webPublicationDate.toDateTime(DateTimeZone.UTC).toLocalDate.isEqual(matchDate))
        (for {
          matchReport <- navContent.find(_.isMatchReport)
          liveBlog <- navContent.find(_.isLiveBlog)
        } yield {
          log.info(s"Found report ${matchReport.id} and live blog ${liveBlog.id} for ${rugbyMatch.key}")
          Future.successful(Some(MatchNavigation(matchReport, liveBlog)))
        }).getOrElse {
          log.warn(s"Failed to find match report and live blog for ${rugbyMatch.toString}")
          Future.successful(None)
        }
    }.recoverWith {
      case error: Throwable => {
        log.warn(s"Rugby capi query failed: ${error.getMessage}")
        Future.successful(None)
      }
    }
  }
}