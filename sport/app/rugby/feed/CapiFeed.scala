package rugby.feed

import common.{Edition, Logging}
import contentapi.ContentApiClient
import model.{Content, ContentType}
import org.joda.time.DateTimeZone
import rugby.model.Match
import implicits.Dates.jodaToJavaInstant
import scala.concurrent.{ExecutionContext, Future}

case class MatchNavigation(
  matchReport: ContentType,
  minByMin: ContentType
)

class CapiFeed(contentApiClient: ContentApiClient) extends Logging {

  def getMatchArticles(matches: Seq[Match])(implicit executionContext: ExecutionContext) : Future[Map[String, MatchNavigation]] = {
    Future.sequence(
      matches.map { rugbyMatch =>
        loadNavigation(rugbyMatch).map( _.map( (rugbyMatch.key, _) ) )
      }
    ).map(_.flatten.toMap)
  }

  private def loadNavigation(rugbyMatch: Match)(implicit executionContext: ExecutionContext): Future[Option[MatchNavigation]] = {
    val matchDate = rugbyMatch.date.toLocalDate
    val teamTags = rugbyMatch.teamTags.mkString(",")
    val searchTags = s"(tone/matchreports,sport/rugby-union,$teamTags) | (tone/minutebyminute,sport/rugby-union,$teamTags)"

    log.info(s"Looking for ${rugbyMatch.toString}")

    val startMatchDayRange = matchDate.toDateTimeAtStartOfDay
    val endMatchDayRange = matchDate.plusDays(2).toDateTimeAtStartOfDay

    contentApiClient.getResponse(contentApiClient.search(Edition.defaultEdition)
      .section("sport")
      .tag(searchTags)
      .fromDate(jodaToJavaInstant(startMatchDayRange))
      .toDate(jodaToJavaInstant(endMatchDayRange))
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
      case error: Throwable =>
        log.warn(s"Rugby capi query failed: ${error.getMessage}")
        Future.successful(None)
    }
  }
}
