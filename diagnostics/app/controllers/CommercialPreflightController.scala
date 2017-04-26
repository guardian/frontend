package controllers

import conf.Configuration
import common.{ExecutionContexts, Logging}
import model.PrivateCache
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Controller}

import java.lang.Long.{toString => toStringBase}
import scala.util.{Success, Failure, Random}

// This Pre-Flight mechanism allows the CDN to make an early ad call. The CDN contains an esi which routes
// to the CommercialPreFlightController, the /esi/ad-call route. This controller forwards the call to Switch.
// It is necessary to pass an ophan page view, and some page targeting (for AppNexus), so this logic is all
// contained below.

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
  targeting_variables: Option[AppNexusTargeting]
)

case class AdTargeting(
  ct: String,
  co: List[String],
  url: String,
  su: List[String],
  edition: String,
  tn: List[String],
  p: String,
  k: List[String]
) {
  def toAppNexusTargeting: AppNexusTargeting = {

    AppNexusTargeting(
      pt1 = url,
      pt2 = edition,
      pt3 = ct,
      pt4 = p,
      pt5 = k.mkString(","),
      pt6 = su.mkString(","),
      pt9 = (co ++ tn).mkString("|")
    )
  }
}

// pt7 and pt8 are browser-based, we can't populate them from the esi-based ad call.
case class AppNexusTargeting(
  pt1: String,
  pt2: String,
  pt3: String,
  pt4: String,
  pt5: String,
  pt6: String,
  pt9: String
)

object AppNexusTargeting {
  implicit val appNexusTargeting = Json.writes[AppNexusTargeting]
}

object AdRequest {
  implicit val adRequestWrites = Json.writes[AdRequest]
}

object AdTargeting {
  implicit val adTargetingReads = Json.reads[AdTargeting]
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
    val maybeHost =  request.headers.get("Host")
    val switchId = request.headers.get("X-GU-switch-id")
    val maybeTopUrl = request.headers.get("X-GU-topurl")
    val maybeTargeting = request.getQueryString("sharedAdTargeting").flatMap( targetingObject => {
      Json.parse(targetingObject).asOpt[AdTargeting]
    })

    for {
      clientIp <- maybeClientIp
      host <- maybeHost
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
        url = s"https://$host$topUrl",
        referrer = None,
        browser_dimensions = None,
        switch_user_id = switchId,
        floor_price = None,
        targeting_variables = maybeTargeting.map(_.toAppNexusTargeting)
      ))

      wsClient.url(Configuration.switch.switchAdHubUrl)
        .withQueryString("load_id" -> pageViewId)
        .post(adHubRequest)
        .onComplete({
          case Success(result) => {
            result.status match {
              case 200 => log.logger.info(s"switch ad call success, switch id: ${switchId.getOrElse("unknown user id")}")
              case _ => log.logger.info(s"switch ad call result:${result.status}, ${result.body}, ${adHubRequest.toString}")
            }
          }
          case Failure(e) => log.logger.warn(s"switch ad call failed: ${e.getMessage}")
        })
    }

    // Since this controller is used as an esi endpoint, use cache-control:private to ensure the resource is not cached.
    PrivateCache(Ok(views.html.adCall(pageViewId)))
  }
}