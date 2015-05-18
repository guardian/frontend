package controllers.commercial

import model.commercial.soulmates._
import model.{Cached, NoCache}
import play.api.mvc._

object SoulmatesController extends Controller with implicits.Requests {

  def renderSoulmates(groupName: String): Action[AnyContent] = Action { implicit request =>

    def mixedSample() = {
      def take3(agent: SoulmatesAgent) = agent.sample().take(3)
      val members = take3(SoulmatesAgent.womenAgent) ++ take3(SoulmatesAgent.menAgent)
      Sample.default(members)
    }

    val sample = {
      if (groupName == "mixed") mixedSample()
      else SoulmatesAgent.sample(groupName)
    }

    sample match {
      case Nil => NoCache(jsonFormat.nilResult)
      case soulmates => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(views.html.soulmates.soulmates(soulmates, omnitureId, clickMacro))
      }
    }
  }
}
