package purge

import common.{ExecutionContexts, Logging}
import conf.AdminConfiguration.fastly
import conf.Configuration.environment
import implicits.Dates
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future

class CdnPurge(wsClient: WSClient) extends ExecutionContexts with Dates with Logging {

  private val serviceId = "2eYr6Wx3ZCUoVPShlCM61l"

  // Performs soft purge which will still serve stale if there is an error
  def soft(key:String): Future[WSResponse] = {
    // under normal circumstances we only ever want this called from PROD.
    // Don't want too much decaching going on.
    if (environment.isProd) {
      val purgeRequest = wsClient.url(s"https://api.fastly.com/service/$serviceId/purge/$key")
        .withHeaders("Fastly-Key" -> fastly.key,
                     "Fastly-Soft-Purge" -> "1")
        .post("")

      purgeRequest.onSuccess { case r => log.info(s"purge $key from Fastly with response ${r.statusText}") }
      purgeRequest
    } else {
      Future.failed(new RuntimeException("Purging is disabled in non-production environment"))
    }
  }
}
