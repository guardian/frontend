package controllers

import play.api.libs.json.{Format, Json}
import play.api.mvc.{BaseController, ControllerComponents}

class FakeGeolocationController(val controllerComponents: ControllerComponents) extends BaseController {

  case class FakeGeolocation(country: String)
  implicit val jf: Format[FakeGeolocation] = Json.format[FakeGeolocation]

  def geolocation = Action {
    val fake = FakeGeolocation("GB")
    Ok(Json.toJson(fake))
  }
}
