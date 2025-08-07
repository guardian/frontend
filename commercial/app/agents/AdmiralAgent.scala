package agents

import common.{Box, GuLogging}
import conf.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

class AdmiralAgent(wsClient: WSClient) extends GuLogging with implicits.WSRequests {

  private val scriptCache = Box[Option[String]](None)

  private val environment = Configuration.environment.stage
  private val admiralUrl = Configuration.commercial.admiralUrl

  private def fetchBootstrapScript(implicit ec: ExecutionContext): Future[String] = {
    log.info(s"Fetching Admiral's bootstrap script via the Install Tag API")
    admiralUrl match {
      case Some(baseUrl) =>
        wsClient
          .url(s"$baseUrl?cacheable=1&environment=$environment")
          .withRequestTimeout(2.seconds)
          .getOKResponse()
          .map(_.body)

      case None =>
        val errorMessage = "No configuration value found for commercial.admiralUrl"
        log.error(errorMessage)
        Future.failed(new Throwable(errorMessage))
    }
  }

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info("Commercial Admiral Agent refresh")
    fetchBootstrapScript.map { script =>
      scriptCache.alter(Some(script))
    }
  }

  def getBootstrapScript: Option[String] = {
    scriptCache.get()
  }
}
