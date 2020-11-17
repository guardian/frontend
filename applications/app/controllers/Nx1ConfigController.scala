package controllers

import play.api.libs.json.{Format, Json}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import views.support.CamelCase

case class Nx1Config(switches: Map[String, Boolean])

object Nx1Config {
  implicit val jf: Format[Nx1Config] = Json.format[Nx1Config]

  def make(): Nx1Config = {
    val switches = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })
    Nx1Config(switches = switches)
  }
}

class Nx1ConfigController(val controllerComponents: ControllerComponents) extends BaseController {
  def nx1Config: Action[AnyContent] =
    Action {
      val config = Nx1Config.make()
      Ok(Json.toJson(config))
    }
}
