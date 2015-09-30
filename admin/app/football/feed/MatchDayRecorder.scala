package football.feed

import common.{Edition, ExecutionContexts, Logging}
import conf.switches.Switches
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.ws.WS
import services.S3
import conf.AdminConfiguration.pa

import scala.concurrent.ExecutionContext
import play.api.Play.current

object MatchDayRecorder extends ExecutionContexts with Logging {

  private val feedDateFormat = DateTimeFormat.forPattern("yyyyMMdd").withZone(Edition.defaultEdition.timezone)
  private val fileDateFormat = DateTimeFormat.forPattern("yyyy/MM/dd/HH-mm-ss").withZone(Edition.defaultEdition.timezone)

  override implicit lazy val executionContext: ExecutionContext = feedsRecorderExecutionContext

  def record(): Unit = if (Switches.FootballFeedRecorderSwitch.isSwitchedOn) {

    val now = DateTime.now
    val feedUrl = s"${pa.footballHost}/api/football/competitions/matchDay/${pa.footballApiKey}/${now.toString(feedDateFormat)}"
    val fileName = s"football-feeds/match-day/${now.toString(fileDateFormat)}.xml"
    val result = WS.url(feedUrl).get()

    result.onFailure {
      case t: Throwable => log.info(s"match day recorder failed $feedUrl", t)
    }

    result.foreach { response =>
      if (response.status != 200) {
        log.info(s"match day recorder failed with status ${response.status} ${response.statusText} $feedUrl")
      } else {
        S3.putPrivate(fileName, response.body, "text/xml")
      }
    }
  }
}
