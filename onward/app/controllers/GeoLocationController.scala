package controllers

import common.JsonComponent
import model.{Cached}
import play.api.mvc.{Action, Controller}
import scala.concurrent.duration._

class GeoLocationController extends Controller {


  def getGeoLocation() = Action { implicit request =>
    val headers = request.headers.toSimpleMap
    val countryCode = headers.getOrElse("X-GU-GeoLocation","country:row").replace("country:","")
    Cached(4*7.days) {
      JsonComponent(
        "country" -> countryCode
      )
    }
  }
}
