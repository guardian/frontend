package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page

case class TablesPage(page: Page, competitions: Seq[Competition])

object LeagueTableController extends Controller with Logging with CompetitionFixtureFilters {

  val page = new Page("http://www.guardian.co.uk/football/matches", "football/tables", "football", "", "All tables")

  def render() = Action { implicit request =>

    val competitons = Competitions.competitions.filter(_.hasLeagueTable)

    Cached(page) {
      Ok(Compressed(views.html.tables(TablesPage(page, competitons))))
    }
  }
}
