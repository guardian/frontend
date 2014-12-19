package football.controllers

import common.Edition
import feed.Competitions
import play.api.mvc.{AnyContent, Action}
import org.joda.time.LocalDate
import model._
import football.model._
import pa.FootballTeam
import model.Competition


object ResultsController extends MatchListController with CompetitionResultFilters {

  private def results(date: LocalDate) = new ResultsList(date, Competitions())
  private val page = new FootballPage("football/results", "football", "All results", "GFE:Football:automatic:results")

  def allResultsForJson(year: String, month: String, day: String) = allResultsFor(year, month, day)
  def allResultsFor(year: String, month: String, day: String): Action[AnyContent] =
    renderAllResults(createDate(year, month, day))

  def allResultsJson() = allResults()
  def allResults(): Action[AnyContent] =
    renderAllResults(LocalDate.now(Edition.defaultEdition.timezone))

  def moreResultsFor(year: String, month: String, day: String): Action[AnyContent] =
    renderMoreResults(createDate(year, month, day))

  def moreResultsForJson(year: String, month: String, day: String) = moreResultsFor(year, month, day)


  private def renderAllResults(date: LocalDate) = Action { implicit request =>
    renderMatchList(page, results(date), filters)
  }

  private def renderMoreResults(date: LocalDate) = Action { implicit request =>
    renderMoreMatches(page, results(date), filters)
  }

  def tagResultsJson(tag: String) = tagResults(tag)
  def tagResults(tag: String): Action[AnyContent] =
    renderTagResults(LocalDate.now(Edition.defaultEdition.timezone), tag)

  def tagResultsForJson(year: String, month: String, day: String, tag: String) = tagResultsFor(year, month, day, tag)
  def tagResultsFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderTagResults(createDate(year, month, day), tag)

  private def renderTagResults(date: LocalDate, tag: String): Action[AnyContent] = {
    lookupCompetition(tag).map { comp =>
      renderCompetitionResults(tag, comp, date)
    }.orElse {
      lookupTeam(tag).map(renderTeamResults(tag, _, date))
    }.getOrElse {
      Action(NotFound)
    }
  }

  private def renderCompetitionResults(competitionName: String, competition: Competition, date: LocalDate) = Action { implicit request =>
    val results = new CompetitionResultsList(date, Competitions(), competition.id)
    val page = new FootballPage(s"football/$competitionName/results", "football", s"${competition.fullName} results",
      "GFE:Football:automatic:competition results")
    renderMatchList(page, results, filters)
  }

  private def renderTeamResults(teamName: String, team: FootballTeam, date: LocalDate) = Action { implicit request =>
    val results = new TeamResultsList(date, Competitions(), team.id)
    val page = new FootballPage(s"/football/$teamName/results", "football", s"${team.name} results",
      "GFE:Football:automatic:team results")
    renderMatchList(page, results, filters)
  }
}
