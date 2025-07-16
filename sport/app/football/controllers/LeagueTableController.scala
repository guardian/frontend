package football.controllers

import common._
import conf.switches.Switches
import feed.CompetitionsService
import model._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import model.content.InteractiveAtom
import contentapi.ContentApiClient
import football.model.{DotcomRenderingFootballTablesDataModel, FootballWomensEuro2025Atom}
import implicits.{HtmlFormat, JsonFormat}
import play.api.libs.ws.WSClient
import renderers.DotcomRenderingService
import services.dotcomrendering.{FootballTablesPagePicker, RemoteRender}

import scala.concurrent.Future.successful

case class TablesPage(
    page: Page,
    tables: Seq[Table],
    urlBase: String,
    filters: Map[String, Seq[CompetitionFilter]] = Map.empty,
    comp: Option[Competition],
    atom: Option[InteractiveAtom] = None,
) {
  lazy val singleCompetition = tables.size == 1
}

class LeagueTableController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
    val contentApiClient: ContentApiClient,
    val wsClient: WSClient,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with CompetitionTableFilters
    with ImplicitControllerExecutionContext {
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()

  // Competitions must be added to this list to show up at /football/tables
  val tableOrder: Seq[String] = Seq(
    "Premier League",
    "Women's Super League",
    "Bundesliga",
    "La Liga",
    "Serie A",
    "Ligue 1",
    "Championship",
    "Scottish Premiership",
    "League One",
    "League Two",
    "Scottish Championship",
    "Scottish League One",
    "Scottish League Two",
    "Champions League",
    "Women's Champions League",
    "Europa League",
    "World Cup 2026 qualifying",
    "Euro 2024",
    "Nations League",
    "Women's Nations League",
    "Africa Cup of Nations",
    "Carabao Cup",
    "International friendlies",
    "FA Cup",
    "Champions League qualifying",
    "Community Shield",
    "Scottish Cup",
    "Women's FA Cup",
    "Women's Euro 2025",
  )

  def sortedCompetitions: Seq[Competition] =
    tableOrder.flatMap(leagueName => competitionsService.competitions.find(_.fullName == leagueName))

  private def loadTables: Seq[Table] = sortedCompetitions.filter(_.hasLeagueTable).map { Table(_) }

  def renderLeagueTablesJson(): Action[AnyContent] = renderLeagueTables()
  def renderLeagueTables(): Action[AnyContent] =
    Action.async { implicit request =>
      val tier = FootballTablesPagePicker.getTier()
      val page = new FootballPage(
        "football/tables",
        "football",
        "All tables",
      )

      val groups = loadTables.map { table =>
        if (table.multiGroup) {
          table.copy(groups = table.groups.take(2).map { group => group.copy(entries = group.entries.take(2)) })
        } else {
          table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(4)) })
        }
      }

      request.getRequestFormat match {
        case JsonFormat if request.forceDCR =>
          val model = DotcomRenderingFootballTablesDataModel(page, groups, filters(tableOrder))
          successful(Cached(CacheTime.FootballTables)(JsonComponent.fromWritable(model)))

        case HtmlFormat if tier == RemoteRender =>
          val model = DotcomRenderingFootballTablesDataModel(page, groups, filters(tableOrder))
          remoteRenderer.getFootballTablesPage(wsClient, DotcomRenderingFootballTablesDataModel.toJson(model))

        case _ =>
          val htmlResponse =
            () =>
              football.views.html.tablesList
                .tablesPage(TablesPage(page, groups, "/football", filters(tableOrder), None))
          val jsonResponse =
            () =>
              football.views.html.tablesList
                .tablesPage(TablesPage(page, groups, "/football", filters(tableOrder), None))

          successful(renderFormat(htmlResponse, jsonResponse, page, Switches.all))
      }

    }

  def renderTeamlistJson(): Action[AnyContent] = renderTeamlist()
  def renderTeamlist(): Action[AnyContent] =
    Action { implicit request =>
      val page = new FootballPage(
        "football/teams",
        "football",
        "All teams",
      )

      val groups = loadTables.map { table =>
        table.copy(groups = table.groups)
      }

      val comps = competitionsService.competitions.filter(_.showInTeamsList).filter(_.hasTeams)

      val htmlResponse =
        () => football.views.html.teamlist(TablesPage(page, groups, "/football", filters(tableOrder), None), comps)
      val jsonResponse =
        () =>
          football.views.html.fragments
            .teamlistBody(TablesPage(page, groups, "/football", filters(tableOrder), None), comps)
      renderFormat(htmlResponse, jsonResponse, page, Switches.all)

    }

  def renderCompetitionJson(competition: String): Action[AnyContent] = renderCompetition(competition)
  def renderCompetition(competition: String): Action[AnyContent] =
    Action.async { implicit request =>
      val tier = FootballTablesPagePicker.getTier()

      val table = loadTables
        .find(_.competition.url.endsWith(s"/$competition"))
        .orElse(loadTables.find(_.competition.id == competition))
      table
        .map { table =>
          val page = new FootballPage(
            s"football/$competition/table",
            "football",
            s"${table.competition.fullName} table",
          )

          val futureAtom = FootballWomensEuro2025Atom.getAtom(
            competition,
            contentApiClient,
            "/atom/interactive/interactives/2025/06/2025-women-euro/2025-women-euro-tables",
          )

          val smallTableGroup =
            table.copy(groups = table.groups.map { group => group.copy(entries = group.entries.take(10)) }).groups(0)

          request.getRequestFormat match {
            case JsonFormat if request.forceDCR =>
              futureAtom.flatMap(maybeAtom => {
                val model = DotcomRenderingFootballTablesDataModel(page, Seq(table), filters(tableOrder), maybeAtom)

                successful(Cached(CacheTime.FootballTables)(JsonComponent.fromWritable(model)))
              })

            case HtmlFormat if tier == RemoteRender =>
              futureAtom.flatMap(maybeAtom => {
                val model = DotcomRenderingFootballTablesDataModel(page, Seq(table), filters(tableOrder), maybeAtom)
                remoteRenderer.getFootballTablesPage(wsClient, DotcomRenderingFootballTablesDataModel.toJson(model))
              })

            case _ =>
              val htmlResponse = () =>
                football.views.html.tablesList
                  .tablesPage(
                    TablesPage(
                      page,
                      Seq(table),
                      table.competition.url,
                      filters(tableOrder),
                      Some(table.competition),
                    ),
                  )
              val jsonResponse = () =>
                football.views.html.tablesList.tablesComponent(
                  table.competition,
                  smallTableGroup,
                  table.competition.fullName,
                  multiGroup = table.multiGroup,
                )

              successful(renderFormat(htmlResponse, jsonResponse, page))
          }
        }
        .getOrElse(
          if (request.isJson) {
            successful(Cached(CacheTime.FootballTables)(JsonNotFound()))
          } else {
            successful(Redirect("/football/tables"))
          },
        )
    }

  def renderCompetitionGroupJson(competition: String, groupReference: String): Action[AnyContent] =
    renderCompetitionGroup(competition, groupReference)
  def renderCompetitionGroup(competition: String, groupReference: String): Action[AnyContent] =
    Action.async { implicit request =>
      val tier = FootballTablesPagePicker.getTier()
      val response = for {
        table <-
          loadTables
            .find(_.competition.url.endsWith(s"/$competition"))
            .orElse(loadTables.find(_.competition.id == competition))
        group <- table.groups.find { group =>
          group.round.name.exists(name => name.toLowerCase == groupReference.toLowerCase.replace("-", " "))
        }
      } yield {
        val page = new FootballPage(
          s"football/$competition/$groupReference/table",
          "football",
          s"${table.competition.fullName} table",
        )

        val heading = group.round.name
          .map(name => s"${table.competition.fullName} - $name")
          .getOrElse(table.competition.fullName)

        val groupTable = Table(table.competition, Seq(group), hasGroups = true)

        request.getRequestFormat match {
          case JsonFormat if request.forceDCR =>
            val model = DotcomRenderingFootballTablesDataModel(page, Seq(groupTable), filters(tableOrder))

            successful(Cached(CacheTime.FootballTables)(JsonComponent.fromWritable(model)))

          case HtmlFormat if tier == RemoteRender =>
            val model = DotcomRenderingFootballTablesDataModel(page, Seq(groupTable), filters(tableOrder))
            remoteRenderer.getFootballTablesPage(wsClient, DotcomRenderingFootballTablesDataModel.toJson(model))

          case _ =>
            val htmlResponse = () =>
              football.views.html.tablesList
                .tablesPage(
                  TablesPage(
                    page,
                    Seq(groupTable),
                    table.competition.url,
                    filters(tableOrder),
                    Some(table.competition),
                  ),
                )
            val jsonResponse = () =>
              football.views.html.tablesList.tablesComponent(
                table.competition,
                group,
                heading,
                multiGroup = false,
                linkToCompetition = true,
              )
            successful(renderFormat(htmlResponse, jsonResponse, page))
        }
      }
      response.getOrElse {
        if (request.isJson) {
          successful(Cached(CacheTime.FootballTables)(JsonNotFound()))
        } else {
          successful(Redirect("/football/tables"))
        }
      }
    }
}
