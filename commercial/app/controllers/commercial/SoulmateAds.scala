package controllers.commercial

import model.commercial.soulmates._
import model.{Cached, NoCache}
import play.api.mvc._

object SoulmateAds extends Controller with implicits.Requests {

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

  def renderBrightonSoulmates = renderSoulmates(SoulmatesBrightonAgent.members)

  def renderNorthwestSoulmates = renderSoulmates(SoulmatesNorthwestAgent.members)

  def renderScotlandSoulmates = renderSoulmates(SoulmatesScotlandAgent.members)

  def renderYoungSoulmates = renderSoulmates(SoulmatesYoungAgent.members)

  def renderMatureSoulmates = renderSoulmates(SoulmatesMatureAgent.members)
}
