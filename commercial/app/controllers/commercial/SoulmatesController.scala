package controllers.commercial

import model.commercial.soulmates.SoulmatesAgent.{menAgent, newMenAgent, newWomenAgent, womenAgent}
import model.commercial.soulmates._
import model.{Cached, NoCache}
import play.api.mvc._
import play.twirl.api.HtmlFormat

object SoulmatesController extends Controller with implicits.Requests {

  private def result(groupName: String,
                     view: (Seq[Member], Option[String], Option[String]) => HtmlFormat.Appendable)
                    (implicit request: Request[AnyContent]): Result = {

    val sample = {
      def take3(agent: SoulmatesAgent) = agent.sample().take(3)
      if (groupName == "mixed") {
        val members = take3(womenAgent) ++ take3(menAgent)
        Sample.default(members)
      } else if (groupName == "mixednew") {
        val members = take3(newWomenAgent) ++ take3(newMenAgent)
        Sample.default(members)
      } else SoulmatesAgent.sample(groupName)
    }

    sample match {
      case Nil => NoCache(jsonFormat.nilResult)
      case soulmates => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(view(soulmates, omnitureId, clickMacro))
      }
    }
  }

  def renderSoulmates(groupName: String): Action[AnyContent] = Action { implicit request =>
    result(groupName, views.html.soulmates.soulmates(_, _, _))
  }

  def renderSoulmatesTest(groupName: String): Action[AnyContent] = Action { implicit request =>
    result(groupName, views.html.soulmates.soulmatesTest(_, _, _))
  }
}
