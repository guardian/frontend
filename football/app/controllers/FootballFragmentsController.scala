package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import model._
import play.api.mvc.{ Content => _, _ }
import pa.Match

object FootballFragmentsController extends Controller with Logging {

  def render(matchId: String) = Action { implicit request =>
    val theMatch = FootballClient.footballMatch(matchId)

    val score = views.html.fragments.scoreLine(theMatch)
    val goals = views.html.fragments.goals(theMatch)

    JsonComponent("score" -> score, "goals" -> goals)
  }
}
