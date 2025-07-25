package commercial

import common.GuLogging
import conf.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

class AdmiralApi extends GuLogging with implicits.WSRequests {

  private lazy val endpoint = Configuration.commercial.admiralEndpoint.get

  def getBootstrapScript(ws: WSClient)(implicit ec: ExecutionContext): Future[String] = {
    ws
      .url(endpoint)
      .addHttpHeaders("Content-Type" -> "text/javascript")
      .withRequestTimeout(1.second)
      .getOKResponse()
      .map(_.body)
  }
}
