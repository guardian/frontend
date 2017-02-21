package controllers

import play.api.libs.json.{Format, Json}
import play.api.mvc.{Action, Controller}

class FakeGeolocationController extends Controller {

  case class FakeGeolocation(country: String)
  implicit val jf: Format[FakeGeolocation] = Json.format[FakeGeolocation]

  def geolocation = Action {
    val fake = FakeGeolocation("GB")
    Ok(Json.toJson(fake))
  }
}
