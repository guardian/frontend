package football.controllers

import common.Edition
import feed.Competitions
import play.api.mvc.{AnyContent, Action, Result}
import org.joda.time.LocalDate
import model._
import football.model._
import pa.FootballTeam
import model.Competition

object ResultsController extends MatchListController with CompetitionResultFilters {

  private def competitionOrTeam(tag: String): Option[Either[Competition, FootballTeam]] = {
    lookupCompetition(tag).map(Left(_))
      .orElse(lookupTeam(tag).map(Right(_)))
  }

  private def byType[A](ifAll: => A)(ifCompetition: Competition => A)(ifTeam: FootballTeam => A)(tag: Option[String]): Option[A] = {
    tag.fold(Option(ifAll)) {
      competitionOrTeam(_).map {
        _ match {
          case Left(competition) => ifCompetition(competition)
          case Right(team) => ifTeam(team)
        }
      }
    }
  }

  private def results(date: LocalDate, tag: Option[String] = None): Option[Results] = {
    def allResults = ResultsList(date, Competitions())
    def competitionResults = (competition: Competition) => CompetitionResultsList(date, Competitions(), competition.id)
    def teamResults = (team: FootballTeam) => TeamResultsList(date, Competitions(), team.id, TeamUrl(team))
    byType[Results](allResults)(competitionResults)(teamResults)(tag)
  }

  private def page(tag: Option[String] = None): Option[FootballPage] = {
    def allPage = new FootballPage("football/results", "football", "All results", "GFE:Football:automatic:results")
    def competitionPage = (competition: Competition) => new FootballPage(s"${competition.url}/results", "football", s"${competition.fullName} results", "GFE:Football:automatic:competition results")
    def teamPage = (team: FootballTeam) => new FootballPage(s"/football/$tag/results", "football", s"${tag} results", "GFE:Football:automatic:team results")
    byType[FootballPage](allPage)(competitionPage)(teamPage)(tag)
  }

  private def renderWith(renderFunction:(FootballPage, Results, Map[String, Seq[CompetitionFilter]]) => Result)
                        (date: LocalDate, tag: Option[String] = None) = {
    val result = for {
      p <- page(tag)
      r <- results(date, tag)
    } yield {
      renderFunction(p, r, filters)
    }
    result.getOrElse(NotFound("No results"))
  }

  private def renderForDate(date: LocalDate, tag: Option[String] = None) = Action { implicit request =>
    renderWith(renderMatchList)(date, tag)
  }

  private def renderMoreForDate(date: LocalDate, tag: Option[String] = None) = Action { implicit request =>
    renderWith(renderMoreMatches)(date, tag)
  }

  /* Public methods */

  def allResults(): Action[AnyContent] = renderForDate(LocalDate.now(Edition.defaultEdition.timezone))
  def allResultsJson() = allResults()

  def allResultsFor(year: String, month: String, day: String): Action[AnyContent] = renderForDate(createDate(year, month, day))
  def allResultsForJson(year: String, month: String, day: String) = allResultsFor(year, month, day)

  def moreResultsFor(year: String, month: String, day: String): Action[AnyContent] = renderMoreForDate(createDate(year, month, day))
  def moreResultsForJson(year: String, month: String, day: String) = moreResultsFor(year, month, day)

  def tagResults(tag: String): Action[AnyContent] = renderForDate(LocalDate.now(Edition.defaultEdition.timezone), Some(tag))
  def tagResultsJson(tag: String) = tagResults(tag)

  def tagResultsFor(year: String, month: String, day: String, tag: String): Action[AnyContent] = renderForDate(createDate(year, month, day), Some(tag))
  def tagResultsForJson(year: String, month: String, day: String, tag: String) = tagResultsFor(year, month, day, tag)

  def moreTagResultsFor(year: String, month: String, day: String, tag: String): Action[AnyContent] = renderMoreForDate(createDate(year, month, day), Some(tag))
  def moreTagResultsForJson(year: String, month: String, day: String, tag: String) = moreTagResultsFor(year, month, day, tag)
}
