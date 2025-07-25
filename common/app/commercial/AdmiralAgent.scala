package commercial

import common.{Box, GuLogging}
import conf.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

class AdmiralAgent(ws: WSClient) extends GuLogging with implicits.WSRequests {

  private val scriptCache = Box[String](null)

  private lazy val endpoint = Configuration.commercial.admiralEndpoint.get

  private def getBootstrapScript(implicit ec: ExecutionContext): Future[String] = {
    ws
      .url(endpoint)
      .addHttpHeaders("Content-Type" -> "text/javascript")
      .withRequestTimeout(1.second)
      .getOKResponse()
      .map(_.body)
  }

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info(s"Admiral Agent refresh()")

    getBootstrapScript(ec).map { script =>
      scriptCache.alter(script)
    }
  }

  def getBootstrapScript: String = {
    scriptCache.get()
  }
}
