package football.controllers

import common.Edition
import common.ImplicitControllerExecutionContext
import feed.CompetitionsService
import football.model._
import model._
import model.content.InteractiveAtom
import contentapi.ContentApiClient
import java.time.LocalDate
import pa.FootballTeam
import play.api.mvc.{Action, AnyContent, ControllerComponents}
import scala.concurrent.Future
import conf.switches.Switches

class FixturesController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
    val contentApiClient: ContentApiClient,
)(implicit context: ApplicationContext)
    extends MatchListController
    with CompetitionFixtureFilters
    with ImplicitControllerExecutionContext {

  private def fixtures(date: LocalDate): FixturesList = FixturesList(date, competitionsService.competitions)
  private val page = new FootballPage("football/fixtures", "football", "All fixtures")

  def allFixturesForJson(year: String, month: String, day: String): Action[AnyContent] =
    allFixturesFor(year, month, day)
  def allFixturesFor(year: String, month: String, day: String): Action[AnyContent] =
    renderAllFixtures(createDate(year, month, day))

  def allFixturesJson(): Action[AnyContent] = allFixtures()
  def allFixtures(): Action[AnyContent] =
    renderAllFixtures(LocalDate.now(Edition.defaultEdition.timezoneId))

  def moreFixturesFor(year: String, month: String, day: String): Action[AnyContent] =
    renderMoreFixtures(fixtures(createDate(year, month, day)))

  def moreFixturesForJson(year: String, month: String, day: String): Action[AnyContent] =
    moreFixturesFor(year, month, day)

  private def renderAllFixtures(date: LocalDate): Action[AnyContent] =
    Action { implicit request =>
      renderMatchList(page, fixtures(date), filters)
    }

  private def renderMoreFixtures(fixtures: Fixtures): Action[AnyContent] =
    Action { implicit request =>
      renderMoreMatches(page, fixtures, filters)
    }

  def moreTagFixturesForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    moreTagFixturesFor(year, month, day, tag)

  def moreTagFixturesFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    getTagFixtures(createDate(year, month, day), tag)
      .map(result => renderMoreFixtures(result._2))
      .getOrElse(Action(NotFound))

  def tagFixturesJson(tag: String): Action[AnyContent] = tagFixtures(tag)
  def tagFixtures(tag: String): Action[AnyContent] =
    renderTagFixtures(LocalDate.now(Edition.defaultEdition.timezoneId), tag)

  def tagFixturesForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    tagFixturesFor(year, month, day, tag)
  def tagFixturesFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderTagFixtures(createDate(year, month, day), tag)

  private def getTagFixtures(date: LocalDate, tag: String): Option[(FootballPage, Fixtures)] = {
    lookupCompetition(tag)
      .map(comp =>
        (
          new FootballPage(s"football/$tag/fixtures", "football", s"${comp.fullName} fixtures"),
          CompetitionFixturesList(date, competitionsService.competitions, comp.id, tag),
        ),
      )
      .orElse {
        lookupTeam(tag).map(team =>
          (
            new FootballPage(s"football/$tag/fixtures", "football", s"${team.name} fixtures"),
            TeamFixturesList(date, competitionsService.competitions, team.id, tag),
          ),
        )
      }
  }

  private def renderTagFixtures(date: LocalDate, tag: String): Action[AnyContent] =
    getTagFixtures(date, tag)
      .map {
        case (page, fixtures) =>
          Action.async { implicit request =>
            tag match {
              case "euro-2024" if Switches.Euro2024Header.isSwitchedOn =>
                val id = "/atom/interactive/interactives/2023/01/euros-2024/match-centre-euros-2024-header"
                val edition = Edition(request)
                contentApiClient
                  .getResponse(contentApiClient.item(id, edition))
                  .map(_.interactive.map(InteractiveAtom.make(_)))
                  .recover { case _ => None }
                  .map(renderMatchList(page, fixtures, filters, _))
              case _ =>
                Future.successful(renderMatchList(page, fixtures, filters, None))
            }
          }
      }
      .getOrElse(Action(NotFound))
}
