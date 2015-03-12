package controllers.commercial

import model.commercial.soulmates.SoulmatesAggregatingAgent.sampleMembers
import model.commercial.soulmates._
import model.{Cached, NoCache}
import play.api.mvc._

object SoulmatesController extends Controller with implicits.Requests {

  private def renderSoulmates(members: Seq[Member]) = Action { implicit request =>
    members match {
        case Nil => NoCache(jsonFormat.nilResult)
        case soulmates => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          jsonFormat.result(views.html.soulmates.soulmates(soulmates, omnitureId, clickMacro))
      }
    }
  }

  private def renderShuffledSoulmates(members: Seq[Member]) = {
    renderSoulmates(sampleMembers(members))
  }

  def renderMixedSoulmates = {
    val women = SoulmatesWomenAgent.sample(3)
    val men = SoulmatesMenAgent.sample(3)
    renderSoulmates(women ++ men)
  }

  def renderSoulmates(subgroup: String): Action[AnyContent] = {
    subgroup match {
      case "brighton" => renderShuffledSoulmates(SoulmatesBrightonAgent.members)
      case "northwest" => renderShuffledSoulmates(SoulmatesNorthwestAgent.members)
      case "scotland" => renderShuffledSoulmates(SoulmatesScotlandAgent.members)
      case "young" => renderShuffledSoulmates(SoulmatesYoungAgent.members)
      case "mature" => renderShuffledSoulmates(SoulmatesMatureAgent.members)
      case "men" => renderSoulmates(SoulmatesMenAgent.sample(6))
      case "women" => renderSoulmates(SoulmatesWomenAgent.sample(6))
      case _ => renderSoulmates(Nil)
    }
  }
}
