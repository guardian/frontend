package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page
import pa.{ Round, LeagueTableEntry }
import common.TeamCompetitions
import play.api.libs.concurrent.Execution.Implicits._

case class TablesPage(
    page: Page,
    tables: Seq[Table],
    urlBase: String,
    filters: Map[String, Seq[CompetitionFilter]] = Map.empty,
    comp: Option[Competition]) {
  lazy val singleCompetition = tables.size == 1
}

object LeagueTableController extends Controller with Logging with CompetitionTableFilters {

  private def loadTables: Seq[Table] = Competitions.competitions.filter(_.hasLeagueTable).map { Table(_) }

  def render() = Action { implicit request =>

    val page = new Page(
      canonicalUrl = None,
      "football/tables",
      "football",
      "All tables",
      "GFE:Football:automatic:tables"
    )

    val groups = loadTables.map { table =>
      if (table.multiGroup) {
        table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(2)) })
      } else {
        table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(4)) })
      }
    }

    Cached(page) {
      Ok(Compressed(views.html.tables(TablesPage(page, groups, "/football", filters, None))))
    }
  }

  def renderTeamlist() = Action { implicit request =>

    val page = new Page(
      Some("http://www.guardian.co.uk/football/clubs"),
      "football/teams",
      "football",
      "All teams",
      "GFE:Football:automatic:teams"
    )

    val groups = loadTables.map { table =>
      table.copy(groups = table.groups)
    }

    val comps = Competitions.competitions.filter(_.showInTeamsList).filter(_.hasTeams)

    Cached(page) {
      Ok(Compressed(views.html.teamlist(TablesPage(page, groups, "/football", filters, None), comps)))
    }
  }

  def renderCompetition(competition: String) = Action { implicit request =>
    loadTables.find(_.competition.url.endsWith(s"/competition")).map { table =>

      val page = new Page(
        Some(s"http://www.guardian.co.uk/football/$competition/tables"),
        "football/tables",
        "football",
        s"${table.competition.fullName} table",
        "GFE:Football:automatic:competition tables"
      )

      Cached(page) {
        Ok(Compressed(views.html.tables(TablesPage(page, Seq(table), table.competition.url, filters, Some(table.competition)))))
      }
    }.getOrElse(Redirect("/football/tables"))
  }
}