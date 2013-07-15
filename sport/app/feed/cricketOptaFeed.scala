package cricketOpta

import common.Logging
import scala.concurrent.{Future, ExecutionContext}
import play.api.libs.ws.{Response, WS}
import Parser._

trait Feed extends Logging {

  // Can be overridden for test.
  def get(url: String): Future[Response] = WS.url(url).withTimeout(2000).get()

  private val baseUrl: String = "http://guardian.cloud.opta.net/"

  def getMatchSummary(matchId: String)(implicit context: ExecutionContext): Future[cricketModel.Match] =
    getFeedData(s"?game_id=$matchId&feed_type=c2").map(parseMatch)

  private def getFeedData(suffix: String)(implicit context: ExecutionContext): Future[String] = {
    get(baseUrl + suffix).map { r =>
      r.status match {
        case 200 => r.body
        case _ => throw new Exception(r.status + " " + r.statusText)
      }
    }
  }
}

object Feed extends Feed {

  private var _http: String => Future[Response] = super.get _
  def http = _http
  def http_= (value: String => Future[Response]) { _http = value }

  override def get(url: String): Future[Response] = _http(url)
}