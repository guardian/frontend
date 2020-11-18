package controllers

import play.api.libs.json.{Format, Json}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader}
import views.support.CamelCase
import experiments.ActiveExperiments
import experiments.ActiveExperiments._

case class Nx1Config(switches: Map[String, Boolean], abTests: Map[String, String])

object Nx1Config {
  implicit val jf: Format[Nx1Config] = Json.format[Nx1Config]

  def makeAbTestReport(implicit request: RequestHeader) = {
    ActiveExperiments.allExperiments
      .filter(e => isParticipating(e) || isControl(e))
      .toSeq
      .map { e => (e.description, e.value) }
      .toMap
  }

  def make(request: RequestHeader): Nx1Config = {
    val switches = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })
    val abTests = makeAbTestReport(request)
    Nx1Config(switches = switches, abTests = abTests)
  }
}

class Nx1ConfigController(val controllerComponents: ControllerComponents) extends BaseController {
  def nx1Config: Action[AnyContent] =
    Action { implicit request =>
      val config = Nx1Config.make(request)
      Ok(Json.toJson(config))
    }
}
