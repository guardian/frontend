package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import play.api.templates.Html
import org.joda.time.DateMidnight
import org.scala_tools.time.Imports._

object TeamResultsController extends Controller with Logging with CompetitionResultFilters {

  def render(teamName: String) = Action { implicit request =>
    val url: String = "/football/" + teamName
    val team = TeamMap.getTeamWithUrl(url).get._2
    val fixtures = Competitions.withTeamMatches(team.id).sortBy(_.fixture.date.getMillis)
    val startDate = new DateMidnight
    val upcomingFixtures = fixtures.filter(_.fixture.date <= startDate).reverse

    val page = new Page(
      "http://www.guardian.co.uk/football/results/" + teamName,
      "football/results" + teamName,
      "football",
      "",
      team.tagName + " results",
      "GFE:Football:automatic:team results"
    )

    Cached(60) {
      val html = views.html.teamFixtures(page, filters, upcomingFixtures)
      Ok(Compressed(html))
    }
  }
}
