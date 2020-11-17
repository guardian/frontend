package controllers

import play.api.libs.json.{Format, Json}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

case class Nx1Config(something: String)

object Nx1Config {
  implicit val jf: Format[Nx1Config] = Json.format[Nx1Config]
}

class Nx1ConfigController(val controllerComponents: ControllerComponents) extends BaseController {
  def nx1Config: Action[AnyContent] =
    Action {
      val config = Nx1Config("for me")
      Ok(Json.toJson(config))
    }
}
