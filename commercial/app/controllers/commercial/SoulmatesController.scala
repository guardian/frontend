package controllers.commercial

import model.commercial.soulmates._
import model.{Cached, NoCache}
import play.api.mvc._

object SoulmatesController extends Controller with implicits.Requests {

  private def renderSoulmates(members: Seq[Member]) = Action { implicit request =>
    SoulmatesAggregatingAgent.sampleMembers(members) match {
      case Nil => NoCache(jsonFormat.nilResult)
      case soulmates => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(views.html.soulmates.soulmates(soulmates, omnitureId, clickMacro))
      }
    }
  }

  def renderMixedSoulmates = {
    val women = SoulmatesWomenAgent.sample(3)
    val men = SoulmatesMenAgent.sample(3)
    renderSoulmates(women ++ men)
  }

  def renderSoulmates(subgroup: String): Action[AnyContent] = {
    subgroup match {
      case "brighton" => renderSoulmates(SoulmatesBrightonAgent.members)
      case "northwest" => renderSoulmates(SoulmatesNorthwestAgent.members)
      case "scotland" => renderSoulmates(SoulmatesScotlandAgent.members)
      case "young" => renderSoulmates(SoulmatesYoungAgent.members)
      case "mature" => renderSoulmates(SoulmatesMatureAgent.members)
      case _ => renderSoulmates(Nil)
    }
  }
}
