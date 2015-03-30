package football.controllers

import common.JsonComponent
import football.containers.FixturesAndResults
import play.api.mvc.{Action, Controller}
import play.twirl.api.Html
import views.html.fragments.containers.facia_cards.{container => containerHtml}

object FixturesAndResultsContainerController extends Controller {
  def renderContainer(teamId: String) = Action { implicit request =>
    FixturesAndResults.makeContainer(teamId) match {
      case Some(container) =>
        JsonComponent(containerHtml(container))

      case None =>
        JsonComponent(Html(""))
    }
  }
}
