package football.controllers

import common.{Edition, LinkTo}
import feed.CompetitionsService
import football.model._
import implicits.HtmlFormat
import model.Cached.WithoutRevalidationResult
import model._

import java.time.LocalDate
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, ControllerComponents, RequestHeader, Result}

import scala.concurrent.Future
import scala.concurrent.Future.successful

class FixturesController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
    val wsClient: WSClient,
)(implicit context: ApplicationContext)
    extends MatchListController
    with CompetitionFixtureFilters {

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
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat => redirectTo(s"football/fixtures/$year/$month/$day")
        case _          => renderMoreMatches(page, fixtures(createDate(year, month, day)), filters)
      }
    }

  def moreFixturesForJson(year: String, month: String, day: String): Action[AnyContent] =
    moreFixturesFor(year, month, day)

  private def renderAllFixtures(date: LocalDate): Action[AnyContent] =
    Action.async { implicit request =>
      renderMatchList(page, fixtures(date), filters)
    }

  def moreTagFixturesForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    moreTagFixturesFor(year, month, day, tag)

  def moreTagFixturesFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat => redirectTo(s"football/$tag/fixtures/$year/$month/$day")
        case _ =>
          getTagFixtures(createDate(year, month, day), tag) match {
            case Some((page, fixtures)) =>
              renderMoreMatches(page, fixtures, filters)
            case None => Future.successful(NotFound)
          }
      }
    }

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
      .map(result =>
        Action.async { implicit request =>
          renderMatchList(
            result._1,
            result._2,
            filters,
          )
        },
      )
      .getOrElse(Action(NotFound))

  def redirectTo(path: String)(implicit request: RequestHeader): Future[Result] =
    successful {
      val params = request.rawQueryStringOption.map(q => s"?$q").getOrElse("")
      Cached(CacheTime.Football)(WithoutRevalidationResult(Found(LinkTo(s"/$path$params"))))
    }
}
