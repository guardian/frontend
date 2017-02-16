package controllers

import common.Logging
import model.NoCache
import org.joda.time.DateTime
import play.api.mvc.{Action, Controller}

import java.lang.Long.{toString => toStringBase}
import scala.util.Random

case class AdRequest(
  loadId: String,             // load_id
  zoneIds: List[Int],            // zone_ids
  /*

  229   970x250, 728x90
  228   300x250

  * */
  ip: String,                 // ip
  userAgent: String,          // user_agent
  url: String,                // url
  referrer: Option[String],           // referrer
  browserDimensions: Option[String],  // browser_dimensions
  switchUserId: Option[String],       // switch_user_id, SWID cookie
  floorPrice: Option[String],         // floor_price
  targetingVariables: Option[String]  // targeting_variables
)

class CommercialPreflightController extends Controller with Logging {

  // This is based on https://github.com/guardian/ophan/blob/master/tracker-js/assets/coffee/ophan/transmit.coffee
  def makeOphanViewId(): String = {
    val datePart = toStringBase(new DateTime().getMillis(), 36)
    val randPart = (for (_ <- 1 to 12) yield toStringBase(Random.nextInt(36), 36)).mkString
    s"$datePart$randPart"
  }

  def adCall() = Action { implicit request =>
    val pageViewId = makeOphanViewId()

    val adHubRequest = AdRequest(
      loadId = pageViewId,
      zoneIds = List(229),
      ip = "",
      userAgent = "",
      url = "",
      referrer = None,
      browserDimensions = None,
      switchUserId = None,
      floorPrice = None,
      targetingVariables = None
    )

    NoCache(Ok(views.html.adCall(pageViewId)))
  }
}