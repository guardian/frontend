package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page
import pa.{ Round, LeagueTableEntry }

case class TablesPage(page: Page, tables: Seq[Table]) {
  lazy val singleCompetition = tables.size == 1
}

case class Group(round: Option[Round], entries: Seq[LeagueTableEntry])

case class Table(competition: Competition, groups: Seq[Group]) {
  lazy val multiGroup = groups.size > 1
}

object LeagueTableController extends Controller with Logging with CompetitionFixtureFilters {

  private def loadTables: Seq[Table] = Competitions.competitions.filter(_.hasLeagueTable).map { comp =>
    val groups = comp.leagueTable
      .groupBy(_.round)
      .map { case (round, table) => Group(round, table) }
      .toSeq.sortBy(_.round.map(_.roundNumber).getOrElse(""))
    Table(comp, groups)
  }

  def render() = Action { implicit request =>

    val page = new Page("http://www.guardian.co.uk/football/matches", "football/tables", "football", "", "All tables")

    val groups = loadTables.map { table =>
      if (table.multiGroup) {
        table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(2)) })
      } else {
        table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(4)) })
      }
    }

    Cached(page) {
      Ok(Compressed(views.html.tables(TablesPage(page, groups))))
    }
  }

  def renderCompetition(competition: String) = Action { implicit request =>

    val page = new Page("http://www.guardian.co.uk/football/matches", "football/tables", "football", "", "All tables")

    loadTables.find(_.competition.url.endsWith("/" + competition)).map { table =>
      Cached(page) {
        Ok(Compressed(views.html.tables(TablesPage(page, Seq(table)))))
      }
    }.getOrElse(NotFound("Not found"))
  }
}
