package agents

import common.{Box, GuLogging}
import conf.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

class AdmiralAgent(wsClient: WSClient) extends GuLogging with implicits.WSRequests {

  private val scriptCache = Box[String](null)

  private def fetchBootstrapScript(implicit ec: ExecutionContext): Future[String] = {
    Configuration.commercial.admiralUrl match {
      case Some(admiralUrl) =>
        log.info(s"Fetching Admiral's bootstrap script via the Install Tag API")
        wsClient
          .url(admiralUrl)
          .withRequestTimeout(2.seconds)
          .getOKResponse()
          .map(_.body)

      case None => Future.failed(new Throwable("No configuration value available for commercial.admiralEndpoint"))
    }
  }

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info(s"Admiral Agent refresh()")
    fetchBootstrapScript.map { script =>
      scriptCache.alter(script)
    }
  }

  def getBootstrapScript: String = {
    scriptCache.get()
  }
}
