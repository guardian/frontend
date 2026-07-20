package controllers

import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import views.support.CamelCase

/*
  Nx1Config (project name) was introduced to provide the client-side with metadata in places where the
  usual article client side JavaScript config object is not available

  The urls currently active are

    - https://www.theguardian.com/switches.json
    - https://www.theguardian.com/tests.json
    - mark: 2QJfZo - keep these in sync with other instances https://github.com/search?q=org%3Aguardian+2QJfZo&type=code

  If more metadata is required in the future then do add new routes instead of overloading existing public objects.

  If an object needs to be modified in a non backward compatible way, then also create a new route and let the clients know.
 */

class Nx1ConfigController(val controllerComponents: ControllerComponents) extends BaseController {
  def switches: Action[AnyContent] =
    Action { implicit request =>
      val switches = conf.switches.Switches.all
        .filter(_.exposeClientSide)
        .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
          acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
        })
      Ok(Json.toJson(switches))
    }

  def tests: Action[AnyContent] =
    Action {
      Ok(Json.toJson(Map.empty[String, String]))
    }
}
