package purge

import common.GuLogging
import conf.AdminConfiguration.fastly
import conf.Configuration.environment
import implicits.Dates
import play.api.libs.ws.{WSClient, WSResponse}
import conf.AdminConfiguration.fastly

import scala.concurrent.{ExecutionContext, Future}

sealed trait FastlyService { def serviceId: String }
case object GuardianHost extends FastlyService { val serviceId = fastly.serviceId }
case object AjaxHost extends FastlyService { val serviceId = fastly.ajaxServiceId }

object CdnPurge extends Dates with GuLogging {

  // Performs soft purge which will still serve stale if there is an error
  def soft(
      wsClient: WSClient,
      key: String,
      fastlyService: FastlyService,
  )(implicit executionContext: ExecutionContext): Future[String] = {
    // Fastly is in front of PROD and CODE but not locally running dev instances
    val result: Future[WSResponse] = if (environment.isProd || environment.isCode) {
      val serviceId = fastlyService.serviceId
      val endpoint = s"https://api.fastly.com/service/$serviceId/purge/$key"
      log.debug(
        s"Attempting to purge fastly cache from end point: $endpoint with key: ${fastly.key.substring(0, 4)} and service ID: ${serviceId}",
      )

      wsClient
        .url(endpoint)
        .withHttpHeaders(
          "Fastly-Key" -> fastly.key,
          "Fastly-Soft-Purge" -> "1",
        )
        .post("")
        .map { response =>
          response.status match {
            case responseCode if (200 to 299) contains responseCode =>
              log.info(s"purge $key from Fastly with response ${response.statusText}")
              response
            case _ =>
              throw new RuntimeException(
                s"Purge request to Fastly failed with response ${response.status} ${response.statusText}",
              )
          }
        }
    } else {
      Future.failed(new RuntimeException("Purging is disabled in non-production environment"))
    }
    result
      .map { _ => "Purge request successfully sent" }
      .recover { case e => s"Purge request was not successful, please report this issue: '${e.getLocalizedMessage}'" }
  }
}
