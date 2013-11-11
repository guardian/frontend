package controllers.commercial

import play.api.mvc._
import common.{JsonComponent, ExecutionContexts}
import play.api.libs.ws.{Response, WS}
import model.commercial.masterclasses.{MasterClassAgent, MasterClass, MasterClassesApi}
import scala.util.Random

object MasterClasses extends Controller with ExecutionContexts {

  def list = Action {
    implicit request =>

      val upcoming: List[MasterClass] = MasterClassAgent.getUpcoming

      if (!upcoming.isEmpty) {
        JsonComponent {
          "html" -> views.html.masterclasses(Random.shuffle(upcoming).take(3))
        } withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        Ok("No masterclasses") withHeaders ("Cache-Control" -> "max-age=60")
      }
  }
}
