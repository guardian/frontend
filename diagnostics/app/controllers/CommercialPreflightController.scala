package controllers

import conf.Configuration
import common.{ExecutionContexts, Logging}
import model.NoCache
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Controller}

import java.lang.Long.{toString => toStringBase}
import scala.util.{Success, Failure, Random}

case class AdRequest(
  load_id: String,
  zone_ids: List[Int],
  ip: String,
  user_agent: String,
  url: String,
  referrer: Option[String],
  browser_dimensions: Option[String],
  switch_user_id: Option[String],       // switch_user_id, SWID cookie
  floor_price: Option[String],
  targeting_variables: Option[String]
)

object AdRequest {
  implicit val adRequestWrites = Json.writes[AdRequest]
}

class CommercialPreflightController(wsClient: WSClient) extends Controller with Logging with ExecutionContexts {

  // This is based on https://github.com/guardian/ophan/blob/master/tracker-js/assets/coffee/ophan/transmit.coffee
  def makeOphanViewId(): String = {
    val datePart = toStringBase(new DateTime().getMillis, 36)
    val randPart = (for (_ <- 1 to 12) yield toStringBase(Random.nextInt(36), 36)).mkString
    s"$datePart$randPart"
  }

  // This processes esi sub-requests from fastly.
  def adCall() = Action { implicit request =>
    val pageViewId = makeOphanViewId()

    val maybeClientIp = request.headers.get("Fastly-Client-IP")
    val maybeUserAgent = request.headers.get("User-Agent")
    val switchId = request.headers.get("X-GU-switch-id")
    val maybeTopUrl = request.headers.get("X-GU-topurl")

    // Log the request headers to check the esi subrequest is working.
    log.logger.info(request.headers.toSimpleMap.toList.collect { case (key: String, value: String) => s"$key:$value" }.mkString(", "))

    for {
      clientIp <- maybeClientIp
      topUrl <- maybeTopUrl
      userAgent <- maybeUserAgent
    } {
      val adHubRequest = Json.toJson(AdRequest(
        load_id = pageViewId,
        zone_ids = List(229, 228),
        /*  id    sizes
            229   970x250, 728x90
            228   300x250
        */
        ip = clientIp,
        user_agent = userAgent,
        url = topUrl,
        referrer = None,
        browser_dimensions = None,
        switch_user_id = switchId,
        floor_price = None,
        targeting_variables = None
      ))

      wsClient.url(Configuration.switch.switchAdHubUrl)
        .post(adHubRequest)
        .onComplete({
          case Success(_) => log.logger.info(s"switch ad call success for ${adHubRequest.toString()}, ${switchId.getOrElse("unknown user id")}")
          case Failure(e) => log.logger.warn(s"switch ad call failed: ${e.getMessage}")
        })
    }

    NoCache(Ok(views.html.adCall(pageViewId)))
  }
}