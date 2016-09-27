package controllers.commercial

import common.JsonComponent
import model.commercial.soulmates.SoulmatesAgent.{menAgent, newMenAgent, newWomenAgent, womenAgent}
import model.commercial.soulmates._
import model.{Cached, NoCache}
import play.api.mvc._

import scala.concurrent.duration._

class SoulmatesController extends Controller with implicits.Requests {

  private def soulmatesSample(groupName: String): Seq[Member] = {

    def take3(agent: SoulmatesAgent) = agent.sample().take(3)

    groupName match {
      case "mixed" => {
        val members = take3(womenAgent) ++ take3(menAgent)
        Sample.default(members)
      }
      case "mixednew" => {
        val members = take3(newWomenAgent) ++ take3(newMenAgent)
        Sample.default(members)
      }
      case _ => SoulmatesAgent.sample(groupName)
    }
  }

  def renderSoulmates(groupName: String) = Action { implicit request =>
    soulmatesSample(groupName).toList match {
      case Nil => NoCache(jsonFormat.nilResult.result)
      case soulmates => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(views.html.soulmates.soulmates(soulmates, omnitureId, clickMacro))
      }
    }
  }

  def getSoulmates(groupName: String) = Action { implicit request =>

    Cached(60.seconds){
      JsonComponent(soulmatesSample(groupName))
    }
  }
}
