package cricketOpta

import scala.concurrent.{Future, ExecutionContext}
import play.api.libs.ws.WS
import Parser._

object Feed {

  private val baseUrl: String = "http://guardian.cloud.opta.net/"

  def getMatchSummary(matchId: String)(implicit context: ExecutionContext): Future[cricketModel.Match] =
    get(s"?game_id=$matchId&feed_type=c2").map(parseMatch)

  private def get(suffix: String)(implicit context: ExecutionContext): Future[String] = {
    WS.url(baseUrl + suffix).withTimeout(2000).get().map { r =>
        r.status match {
          case 200 => r.body
          case _ => throw new Exception(r.status + " " + r.statusText)
        }
    }
  }
}