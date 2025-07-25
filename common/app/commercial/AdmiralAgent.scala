package commercial

import common.{Box, GuLogging}
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}

object AdmiralAgent extends GuLogging {

  private val scriptCache = Box(String)

  def refresh(ws: WSClient, admiralApi: AdmiralApi)(implicit ec: ExecutionContext): Future[Unit] = {
    log.info(s"Admiral Agent refresh()")

    admiralApi.getBootstrapScript(ws)(ec).map { script =>
      scriptCache.alter(script)
    }
  }

  def getBootstrapScript: String = {
    scriptCache.get()
  }
}
