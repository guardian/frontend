package football.controllers

import common._
import conf.switches.Switches
import feed.CompetitionsService
import play.api.mvc.{Action, AnyContent, Controller}
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

class LeagueTableController(val competitionsService: CompetitionsService)(implicit context: ApplicationContext) extends Controller with Logging with CompetitionTableFilters with ExecutionContexts {

    val tableOrder = Seq(
        "Premier League",
        "La Liga",
        "Bundesliga",
        "Serie A",
        "Ligue 1",
        "Championship",
        "Scottish Premiership",
        "League One",
        "League Two",
        "Scottish Championship",
        "Scottish League One",
        "Scottish League Two",
        "Euro 2016",
        "Euro 2016 qualifying",
        "Champions League qualifying",
        "Europa League",
        "Champions League",
        "FA Cup",
        "EFL Cup",
        "Community Shield",
        "Scottish Cup",
        "Scottish League Cup",
        "World Cup 2018 Qualifiers",
        "International friendlies"
    )

  def sortedCompetitions:Seq[Competition] = tableOrder.flatMap(leagueName => competitionsService.competitions.find(_.fullName == leagueName))

  private def loadTables: Seq[Table] = sortedCompetitions.filter(_.hasLeagueTable).map { Table(_) }

  def renderLeagueTableJson(): Action[AnyContent] = renderLeagueTable()
  def renderLeagueTable() = Action { implicit request =>

    val page = new FootballPage(
      "football/tables",
      "football",
      "All tables"
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

  def renderTeamlistJson(): Action[AnyContent] = renderTeamlist()
  def renderTeamlist() = Action { implicit request =>

    val page = new FootballPage(
      "football/teams",
      "football",
      "All teams"
    )

    val groups = loadTables.map { table =>
      table.copy(groups = table.groups)
    }

    val comps = competitionsService.competitions.filter(_.showInTeamsList).filter(_.hasTeams)

    val htmlResponse = () => football.views.html.teamlist(TablesPage(page, groups, "/football", filters, None), comps)
    val jsonResponse = () => football.views.html.fragments.teamlistBody(TablesPage(page, groups, "/football", filters, None), comps)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)

  }

  def renderCompetitionJson(competition: String): Action[AnyContent] = renderCompetition(competition)
  def renderCompetition(competition: String) = Action { implicit request =>
    val table = loadTables.find(_.competition.url.endsWith(s"/$competition")).orElse(loadTables.find(_.competition.id == competition))
    table.map { table =>

      val page = new FootballPage(
        "football/tables",
        "football",
        s"${table.competition.fullName} table"
      )

      val smallTableGroup = table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(10)) }).groups(0)
      val htmlResponse = () => football.views.html.tablesList.tablesPage(TablesPage(page, Seq(table), table.competition.url, filters, Some(table.competition)))
      val jsonResponse = () => football.views.html.tablesList.tablesComponent(table.competition, smallTableGroup, multiGroup = table.multiGroup)

      renderFormat(htmlResponse, jsonResponse, page)

    }.getOrElse(
      if(request.isJson) {
        Cached(60)(JsonNotFound())
      } else {
        Redirect("/football/tables")
      }
    )
  }

  def renderCompetitionGroupJson(competition: String, groupReference: String): Action[AnyContent] = renderCompetitionGroup(competition, groupReference)
  def renderCompetitionGroup(competition: String, groupReference: String) = Action { implicit request =>
    val response = for {
      table <- loadTables.find(_.competition.url.endsWith(s"/$competition")).orElse(loadTables.find(_.competition.id == competition))
      group <- table.groups.find { group =>
        group.round.name.exists(name => name.toLowerCase == groupReference.toLowerCase.replace("-", " "))
      }
    } yield {
      val page = new FootballPage(
        "football/tables",
        "football",
        s"${table.competition.fullName} table"
      )
      val groupTable = Table(table.competition, Seq(group), hasGroups = true)
      val htmlResponse = () => football.views.html.tablesList.tablesPage(TablesPage(page, Seq(groupTable), table.competition.url, filters, Some(table.competition)))
      val jsonResponse = () => football.views.html.tablesList.tablesComponent(table.competition, group, multiGroup = false)
      renderFormat(htmlResponse, jsonResponse, page)
    }
    response.getOrElse {
      if(request.isJson) {
        Cached(60)(JsonNotFound())
      } else {
        Redirect("/football/tables")
      }
    }
  }
}
