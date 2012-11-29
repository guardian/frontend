package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import play.api.templates.Html
import org.joda.time.DateMidnight
import org.scala_tools.time.Imports._

object TeamFixturesController extends Controller with Logging with CompetitionFixtureFilters {

  def render(teamName: String) = Action { implicit request =>
    val url: String = "/football/" + teamName
    val team = TeamMap.getTeamWithUrl(url).get._2
    val fixtures = Competitions.withTeamMatches(team.id).sortBy(_.fixture.date.getMillis)
    val startDate = new DateMidnight
    val upcomingFixtures = fixtures.filter(_.fixture.date >= startDate)

    val page = new Page(
      "http://www.guardian.co.uk/football/" + teamName + "/fixtures",
      "football/" + teamName + "fixtures",
      "football",
      "",
      team.tagName + " fixtures",
      "GFE:Football:automatic:team fixtures"
    )

    Cached(60) {
      val html = views.html.teamFixtures(page, filters, upcomingFixtures)
      Ok(Compressed(html))
    }
  }

  def renderComponent(teamId: String) = Action { implicit request =>
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
