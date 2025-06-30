package football.controllers

import common.Edition
import contentapi.ContentApiClient
import feed.CompetitionsService
import play.api.mvc.{Action, AnyContent, ControllerComponents, Result}
import java.time.LocalDate
import model._
import football.model._
import pa.FootballTeam
import model.Competition
import model.content.InteractiveAtom
import play.api.libs.ws.WSClient

import scala.concurrent.Future

class ResultsController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
    val contentApiClient: ContentApiClient,
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
  )(date: LocalDate, tag: Option[String] = None, maybeAtom: Option[InteractiveAtom]): Future[Result] = {
    val result = for {
      p <- page(tag)
      r <- results(date, tag)
    } yield {
      renderFunction(p, r, filters, maybeAtom)
    }
    result.getOrElse(Future.successful(NotFound("No results")))
  }

  private def renderForDate(date: LocalDate, tag: Option[String] = None): Action[AnyContent] =
    Action.async { implicit request =>
      tag match {
        case Some(t) =>
          val futureAtom = FootballWomensEuro2025Atom.getAtom(
            t,
            contentApiClient,
            "/atom/interactive/interactives/2025/06/2025-women-euro/2025-women-euro-tables",
          )
          futureAtom.flatMap(maybeAtom => renderWithAsync(renderMatchList)(date, tag, maybeAtom))

        case None => renderWithAsync(renderMatchList)(date, tag, None)
      }
    }

  private def renderMoreForDate(date: LocalDate, tag: Option[String] = None): Action[AnyContent] =
    Action.async { implicit request =>
      renderWithAsync(renderMoreMatches)(date, tag, None)
    }

  /* Public methods */

  def allResults(): Action[AnyContent] = renderForDate(LocalDate.now(Edition.defaultEdition.timezoneId))
  def allResultsJson(): Action[AnyContent] = allResults()

  def allResultsFor(year: String, month: String, day: String): Action[AnyContent] =
    renderForDate(createDate(year, month, day))
  def allResultsForJson(year: String, month: String, day: String): Action[AnyContent] = allResultsFor(year, month, day)

  def moreResultsForJson(year: String, month: String, day: String): Action[AnyContent] =
    renderMoreForDate(createDate(year, month, day))

  def tagResults(tag: String): Action[AnyContent] = {
    renderForDate(LocalDate.now(Edition.defaultEdition.timezoneId), Some(tag))
  }

  def tagResultsJson(tag: String): Action[AnyContent] = tagResults(tag)

  def tagResultsFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderForDate(createDate(year, month, day), Some(tag))
  def tagResultsForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    tagResultsFor(year, month, day, tag)

  def moreTagResultsForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderMoreForDate(createDate(year, month, day), Some(tag))
}
