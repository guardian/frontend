package controllers

import common.Logging
import model.NoCache
import org.joda.time.DateTime
import play.api.mvc.{Action, Controller}

import java.lang.Long.{toString => toStringBase}
import scala.util.Random

case class AdRequest(
  loadId: String,             // load_id
  zoneIds: String,            // zone_ids
  ip: String,                 // ip
  userAgent: String,          // user_agent
  url: String,                // url
  referrer: String,           // referrer
  browserDimensions: String,  // browser_dimensions
  switchUserId: String,       // switch_user_id
  floorPrice: String,         // floor_price
  targetingVariables: String  // targeting_variables
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
    NoCache(Ok(templates.js.adCall(pageViewId)))
  }
}