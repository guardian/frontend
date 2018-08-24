package purge

import common.Logging
import conf.AdminConfiguration.fastly
import conf.Configuration.environment
import implicits.Dates
import play.api.libs.ws.{WSClient, WSResponse}
import conf.AdminConfiguration.fastly

import scala.concurrent.{ExecutionContext, Future}

object CdnPurge extends Dates with Logging {

  sealed trait FastlyService { def serviceId: String }
  case object GuardianHost extends FastlyService { val serviceId = fastly.serviceId }
  case object AjaxHost extends FastlyService { val serviceId = fastly.ajaxServiceId }

  // Performs soft purge which will still serve stale if there is an error
  def soft(wsClient: WSClient, key:String, fastlyService: FastlyService)(implicit executionContext: ExecutionContext): Future[WSResponse] = {
    // under normal circumstances we only ever want this called from PROD.
    // Don't want too much decaching going on.
    if (environment.isProd) {
      val serviceId = fastlyService.serviceId
      wsClient.url(s"https://api.fastly.com/service/$serviceId/purge/$key")
        .withHttpHeaders(
          "Fastly-Key" -> fastly.key,
          "Fastly-Soft-Purge" -> "1"
        )
        .post("")
        .map { response =>
          response.status match {
            case responseCode if (200 to 299) contains responseCode =>
              log.info(s"purge $key from Fastly with response ${response.statusText}")
              response
            case _ =>
              throw new RuntimeException(s"Purge request to Fastly failed with response ${response.status} ${response.statusText}")
          }
        }
    } else {
      Future.failed(new RuntimeException("Purging is disabled in non-production environment"))
    }
  }
}
