package controllers.commercial

import model.commercial.soulmates._
import model.{Cached, NoCache}
import play.api.mvc._
import play.twirl.api.HtmlFormat

object SoulmatesController extends Controller with implicits.Requests {

  private def result(groupName: String,
                     view: (Seq[Member], Option[String], Option[String]) => HtmlFormat.Appendable)
                    (implicit request: Request[AnyContent]): Result = {

    val sample = {
      if (groupName == "mixed") {
        def take3(agent: SoulmatesAgent) = agent.sample().take(3)
        val members = take3(SoulmatesAgent.womenAgent) ++ take3(SoulmatesAgent.menAgent)
        Sample.default(members)
      } else SoulmatesAgent.sample(groupName)
    }

    sample match {
      case Nil => NoCache(jsonFormat.nilResult)
      case soulmates => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(view(soulmates, clickMacro, omnitureId))
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
