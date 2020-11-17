package controllers

import play.api.libs.json.{Format, Json}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class Nx1ConfigController(val controllerComponents: ControllerComponents) extends BaseController {

  // implicit val jf: Format[FakeGeolocation] = Json.format[FakeGeolocation]

  def nx1Config: Action[AnyContent] =
    Action {
      Ok("Testing")
    }
}
