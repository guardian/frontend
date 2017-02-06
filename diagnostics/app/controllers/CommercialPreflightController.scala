package controllers

import common.Logging
import model.NoCache
import play.api.mvc.{Action, Controller}

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

  def adCall() = Action { implicit request =>
    NoCache(Ok(views.html.fragments.adCall()))
  }
}