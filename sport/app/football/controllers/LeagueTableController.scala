package controllers

import common._
import conf._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page
import pa.{ Round, LeagueTableEntry }
import common.TeamCompetitions


case class TablesPage(
    page: Page,
    tables: Seq[Table],
    urlBase: String,
    filters: Map[String, Seq[CompetitionFilter]] = Map.empty,
    comp: Option[Competition]) {
  lazy val singleCompetition = tables.size == 1
}

object LeagueTableController extends Controller with Logging with CompetitionTableFilters with ExecutionContexts {

  private def loadTables: Seq[Table] = Competitions.competitions.filter(_.hasLeagueTable).map { Table(_) }

  def renderLeagueTableJson() = renderLeagueTable()
  def renderLeagueTable() = Action { implicit request =>

    val page = new Page(
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
    
    val htmlResponse = () => football.views.html.tables(TablesPage(page, groups, "/football", filters, None))
    val jsonResponse = () => football.views.html.fragments.tablesBody(TablesPage(page, groups, "/football", filters, None))
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)

  }

  def renderTeamlistJson() = renderTeamlist()
  def renderTeamlist() = Action { implicit request =>

    val page = new Page(
      "football/teams",
      "football",
      "All teams",
      "GFE:Football:automatic:teams"
    )

    val groups = loadTables.map { table =>
      table.copy(groups = table.groups)
    }

    val comps = Competitions.competitions.filter(_.showInTeamsList).filter(_.hasTeams)
    
    val htmlResponse = () => football.views.html.teamlist(TablesPage(page, groups, "/football", filters, None), comps)
    val jsonResponse = () => football.views.html.fragments.teamlistBody(TablesPage(page, groups, "/football", filters, None), comps)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)

  }

  def renderCompetitionJson(competition: String) = renderCompetition(competition)
  def renderCompetition(competition: String) = Action { implicit request =>
    loadTables.find(_.competition.url.endsWith(s"/$competition")).map { table =>

      val page = new Page(
        "football/tables",
        "football",
        s"${table.competition.fullName} table",
        "GFE:Football:automatic:competition tables"
      )
    
      val htmlResponse = () => football.views.html.tables(TablesPage(page, Seq(table), table.competition.url, filters, Some(table.competition)))
      val jsonResponse = () => football.views.html.fragments.tablesBody(TablesPage(page, Seq(table), table.competition.url, filters, Some(table.competition)))
      renderFormat(htmlResponse, jsonResponse, page, Switches.all)
    }.getOrElse(Redirect("/football/tables"))
  }
}