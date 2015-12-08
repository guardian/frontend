package rugby.feed

import common.{Edition, Logging, ExecutionContexts}
import conf.LiveContentApi
import model.{Content, ContentType}
import org.joda.time.DateTimeZone
import rugby.jobs.RugbyStatsJob
import rugby.model.Match

import scala.concurrent.Future

case class MatchNavigation(
  matchReport: ContentType,
  minByMin: ContentType
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
        val navContent = response.results.map(Content(_)).filter(_.trail.webPublicationDate.toDateTime(DateTimeZone.UTC).toLocalDate.isEqual(matchDate))
        (for {
          matchReport <- navContent.find(_.tags.isMatchReport)
          liveBlog <- navContent.find(_.tags.isLiveBlog)
        } yield {
          log.info(s"Found report ${matchReport.metadata.id} and live blog ${liveBlog.metadata.id} for ${rugbyMatch.key}")
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