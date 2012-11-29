package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import play.api.templates.Html
import org.joda.time.DateMidnight
import org.scala_tools.time.Imports._

object TeamFixturesController extends Controller with Logging {

  def render(teamId: String) = Action { implicit request =>
    val fixtures = Competitions.withTeamMatches(teamId).sortBy(_.fixture.date.getMillis)

    val startDate = new DateMidnight

    val previousResult = fixtures.filter(_.fixture.date <= startDate).takeRight(1)
    val upcomingFixtures = fixtures.filter(_.fixture.date >= startDate).take(2)

    Cached(60) {
      val html = views.html.fragments.teamFixtures(previousResult, upcomingFixtures)
      request.getQueryString("callback").map { callback =>
        JsonComponent(html)
      } getOrElse {
        Cached(60) {
          Ok(Compressed(html))
        }
      }
    }
  }
}
