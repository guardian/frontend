package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page
import pa.{ Round, LeagueTableEntry }

case class TablesPage(page: Page, tables: Seq[Table])

case class Group(round: Option[Round], entries: Seq[LeagueTableEntry])
case class Table(competition: Competition, groups: Seq[Group])

object LeagueTableController extends Controller with Logging with CompetitionFixtureFilters {

  val page = new Page("http://www.guardian.co.uk/football/matches", "football/tables", "football", "", "All tables")

  def render() = Action { implicit request =>

    val competitons = Competitions.competitions.filter(_.hasLeagueTable)

    val groups = competitons.map { comp =>
      val groups = comp.leagueTable
        .groupBy(_.round)
        .map { case (round, table) => Group(round, table) }
        .toSeq.sortBy(_.round.map(_.roundNumber).getOrElse(""))
      Table(comp, groups)
    }

    Cached(page) {
      Ok(Compressed(views.html.tables(TablesPage(page, groups))))
    }
  }
}
