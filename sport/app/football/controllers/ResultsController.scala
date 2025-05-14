package football.controllers

import common.{Edition, LinkTo}
import feed.CompetitionsService
import play.api.mvc.{Action, AnyContent, ControllerComponents, RequestHeader, Result}

import java.time.LocalDate
import model._
import football.model._
import implicits.HtmlFormat
import model.Cached.WithoutRevalidationResult
import pa.FootballTeam
import model.Competition
import model.content.InteractiveAtom
import play.api.libs.ws.WSClient

import scala.concurrent.Future
import scala.concurrent.Future.successful

class ResultsController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
    val wsClient: WSClient,
)(implicit context: ApplicationContext)
    extends MatchListController
    with CompetitionResultFilters {

  private def competitionOrTeam(tag: String): Option[Either[Competition, FootballTeam]] = {
    lookupCompetition(tag)
      .map(Left(_))
      .orElse(lookupTeam(tag).map(Right(_)))
  }

  private def byType[A](
      ifAll: => A,
  )(ifCompetition: Competition => A)(ifTeam: FootballTeam => A)(tag: Option[String]): Option[A] = {
    tag.fold(Option(ifAll)) {
      competitionOrTeam(_).map {
        case Left(competition) => ifCompetition(competition)
        case Right(team)       => ifTeam(team)
      }
    }
  }

  private def results(date: LocalDate, tag: Option[String] = None): Option[Results] = {
    def allResults = ResultsList(date, competitionsService.competitions)
    def competitionResults =
      (competition: Competition) => CompetitionResultsList(date, competitionsService.competitions, competition.id)
    def teamResults =
      (team: FootballTeam) => TeamResultsList(date, competitionsService.competitions, team.id, TeamUrl(team))
    byType[Results](allResults)(competitionResults)(teamResults)(tag)
  }

  private def page(tag: Option[String] = None): Option[FootballPage] = {
    def allPage = new FootballPage("football/results", "football", "All results")
    def competitionPage =
      (competition: Competition) =>
        new FootballPage(s"${competition.url.stripPrefix("/")}/results", "football", s"${competition.fullName} results")
    def teamPage =
      (team: FootballTeam) =>
        new FootballPage(s"football/${tag.getOrElse("")}/results", "football", s"${team.name} results")
    byType[FootballPage](allPage)(competitionPage)(teamPage)(tag)
  }

  private def renderWithAsync(
      renderFunction: (
          FootballPage,
          Results,
          Map[String, Seq[CompetitionFilter]],
          Option[InteractiveAtom],
      ) => Future[Result],
  )(date: LocalDate, tag: Option[String] = None): Future[Result] = {
    val result = for {
      p <- page(tag)
      r <- results(date, tag)
    } yield {
      renderFunction(p, r, filters, None)
    }
    result.getOrElse(Future.successful(NotFound("No results")))
  }

  private def renderForDate(date: LocalDate, tag: Option[String] = None): Action[AnyContent] =
    Action.async { implicit request =>
      renderWithAsync(renderMatchList)(date, tag)
    }

  private def renderMoreForDate(
      year: String,
      month: String,
      day: String,
      tag: Option[String] = None,
  ): Action[AnyContent] =
    Action.async { implicit request =>
      request.getRequestFormat match {
        case HtmlFormat => {
          tag match {
            case Some(t) => redirectTo(s"football/$tag/results/$year/$month/$day")
            case None    => redirectTo(s"football/results/$year/$month/$day")
          }
        }
        case _ => renderWithAsync(renderMoreMatches)(createDate(year, month, day), tag)
      }
    }

  /* Public methods */

  def allResults(): Action[AnyContent] = renderForDate(LocalDate.now(Edition.defaultEdition.timezoneId))
  def allResultsJson(): Action[AnyContent] = allResults()

  def allResultsFor(year: String, month: String, day: String): Action[AnyContent] =
    renderForDate(createDate(year, month, day))
  def allResultsForJson(year: String, month: String, day: String): Action[AnyContent] = allResultsFor(year, month, day)

  def moreResultsFor(year: String, month: String, day: String): Action[AnyContent] =
    renderMoreForDate(year, month, day)
  def moreResultsForJson(year: String, month: String, day: String): Action[AnyContent] =
    moreResultsFor(year, month, day)

  def tagResults(tag: String): Action[AnyContent] =
    renderForDate(LocalDate.now(Edition.defaultEdition.timezoneId), Some(tag))
  def tagResultsJson(tag: String): Action[AnyContent] = tagResults(tag)

  def tagResultsFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderForDate(createDate(year, month, day), Some(tag))
  def tagResultsForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    tagResultsFor(year, month, day, tag)

  def moreTagResultsFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderMoreForDate(year, month, day, Some(tag))
  def moreTagResultsForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    moreTagResultsFor(year, month, day, tag)

  def redirectTo(path: String)(implicit request: RequestHeader): Future[Result] =
    successful {
      val params = request.rawQueryStringOption.map(q => s"?$q").getOrElse("")
      Cached(CacheTime.Football)(WithoutRevalidationResult(Found(LinkTo(s"/$path$params"))))
    }
}
