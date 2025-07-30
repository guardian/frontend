package agents

import common.{Box, GuLogging}
import conf.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

class AdmiralAgent(wsClient: WSClient) extends GuLogging with implicits.WSRequests {

  private val scriptCache = Box[Option[String]](None)

  private val admiralUrl = Configuration.commercial.admiralUrl;

  private def fetchBootstrapScript(implicit ec: ExecutionContext): Future[String] = {
    log.info(s"Fetching Admiral's bootstrap script via the Install Tag API")
    log.info(s"Admiral URL is: $admiralUrl")
    admiralUrl match {
      case Some(admiralUrl) =>
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
      log.info("Updating the cache with Admiral's script")
      scriptCache.alter(Some(script))
    }
  }

  def getBootstrapScript: Option[String] = {
    scriptCache.get()
  }
}
