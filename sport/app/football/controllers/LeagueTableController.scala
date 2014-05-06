package football.controllers

import common._
import conf._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import model.Page

case class TablesPage(
    page: Page,
    tables: Seq[Table],
    urlBase: String,
    filters: Map[String, Seq[CompetitionFilter]] = Map.empty,
    comp: Option[Competition]) {
  lazy val singleCompetition = tables.size == 1
}

object LeagueTableController extends Controller with Logging with CompetitionTableFilters with ExecutionContexts {

  private def competitions = Competitions().competitions

  private def loadTables: Seq[Table] = competitions.filter(_.hasLeagueTable).map { Table(_) }

  def renderWallchart = Action { implicit request =>
    val page = new Page(
      "football/tables",
      "football",
      "All tables",
      "GFE:Football:automatic:tables"
    )

    val rounds = List(
      "Last 16" -> List(1,2,3,4,5,6,7,8),
      "Quarter-final" -> List(1,2,3,4),
       "Semi-final" -> List(1,2),
      "Final" -> List(1)
    )

    val h = () => football.views.html.matchList.wallchart(page, rounds)
    val j = () => football.views.html.matchList.wallchart(page, rounds)
    renderFormat(h, j, page)
  }

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
        table.copy(groups = table.groups.take(2).map { group => group.copy(entries = group.entries.take(2)) })
      } else {
        table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(4)) })
      }
    }
    
    val htmlResponse = () => football.views.html.tablesList.tablesPage(TablesPage(page, groups, "/football", filters, None))
    val jsonResponse = () => football.views.html.tablesList.tablesPage(TablesPage(page, groups, "/football", filters, None))
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

    val comps = competitions.filter(_.showInTeamsList).filter(_.hasTeams)
    
    val htmlResponse = () => football.views.html.teamlist(TablesPage(page, groups, "/football", filters, None), comps)
    val jsonResponse = () => football.views.html.fragments.teamlistBody(TablesPage(page, groups, "/football", filters, None), comps)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)

  }

  def renderCompetitionJson(competition: String) = renderCompetition(competition)
  def renderCompetition(competition: String) = Action { implicit request =>
    val table = loadTables.find(_.competition.url.endsWith(s"/$competition")).orElse(loadTables.find(_.competition.id == competition))
    table.map { table =>

      val page = new Page(
        "football/tables",
        "football",
        s"${table.competition.fullName} table",
        "GFE:Football:automatic:competition tables"
      )

      val smallTableGroup = table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(10)) }).groups(0)
      val htmlResponse = () => football.views.html.tablesList.tablesPage(TablesPage(page, Seq(table), table.competition.url, filters, Some(table.competition)))
      val jsonResponse = () => football.views.html.tablesList.tablesComponent(table.competition, smallTableGroup, multiGroup = table.multiGroup)

      renderFormat(htmlResponse, jsonResponse, page)

    }.getOrElse(
      if(request.isJson) {
        JsonNotFound()
      } else {
        Redirect("/football/tables")
      }
    )
  }

  def renderCompetitionGroupJson(competition: String, groupReference: String) = renderCompetitionGroup(competition, groupReference)
  def renderCompetitionGroup(competition: String, groupReference: String) = Action { implicit request =>
    val response = for {
      table <- loadTables.find(_.competition.url.endsWith(s"/$competition")).orElse(loadTables.find(_.competition.id == competition))
      group <- table.groups.find { group =>
        group.round.name.exists(name => name.toLowerCase == groupReference.toLowerCase.replace("-", " "))
      }
    } yield {
      val page = new Page(
        "football/tables",
        "football",
        s"${table.competition.fullName} table",
        "GFE:Football:automatic:competition tables"
      )
      val groupTable = Table(table.competition, Seq(group), hasGroups = true)
      val htmlResponse = () => football.views.html.tablesList.tablesPage(TablesPage(page, Seq(groupTable), table.competition.url, filters, Some(table.competition)))
      val jsonResponse = () => football.views.html.tablesList.tablesComponent(table.competition, group, multiGroup = false)
      renderFormat(htmlResponse, jsonResponse, page)
    }
    response.getOrElse {
      if(request.isJson) {
        JsonNotFound()
      } else {
        Redirect("/football/tables")
      }
    }
  }
}