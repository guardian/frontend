package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page
import pa.{ Round, LeagueTableEntry }

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
      "http://www.guardian.co.uk/football/matches",
      "football/tables",
      "football",
      "",
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
      "http://www.guardian.co.uk/football/clubs",
      "football/teams",
      "football",
      "",
      "All teams",
      "GFE:Football:automatic:teams"
    )

    val groups = loadTables.map { table =>
      table.copy(groups = table.groups)
    }

    val competitionList = List(
      "Premier League",
      "Championship",
      "League One",
      "League Two",
      "Scottish Premier League",
      "Scottish Division One",
      "Scottish Division Two",
      "Scottish Division Three"
    )

    Cached(page) {
      Ok(Compressed(views.html.teamlist(TablesPage(page, groups, "/football", filters, None), competitionList)))
    }
  }

  def renderCompetition(competition: String) = Action { implicit request =>
    loadTables.find(_.competition.url.endsWith("/" + competition)).map { table =>

      val page = new Page(
        "http://www.guardian.co.uk/football/matches",
        "football/tables",
        "football",
        "",
        table.competition.fullName + " table",
        "GFE:Football:automatic:competition tables"
      )

      Cached(page) {
        Ok(Compressed(views.html.tables(TablesPage(page, Seq(table), table.competition.url, filters, Some(table.competition)))))
      }
    }.getOrElse(NotFound("Not found"))
  }
}