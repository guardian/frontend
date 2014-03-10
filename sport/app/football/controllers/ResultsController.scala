package football.controllers

import feed.Competitions
import play.api.mvc.{AnyContent, Action}
import org.joda.time.DateMidnight
import model._
import football.model._
import pa.FootballTeam
import model.Competition


object ResultsController extends MatchListController {

  def allResultsForJson(year: String, month: String, day: String) = allResultsFor(year, month, day)
  def allResultsFor(year: String, month: String, day: String): Action[AnyContent] =
    renderAllResults(createDate(year, month, day))

  def allResultsJson() = allResults()
  def allResults(): Action[AnyContent] =
    renderAllResults(DateMidnight.now)

  private def renderAllResults(date: DateMidnight) = Action { implicit request =>
    val results = new ResultsList(date, Competitions())
    val page = new Page("football/results", "football", "All results", "GFE:Football:automatic:results")
    renderMatchList(page, results)
  }

  def tagResultsJson(tag: String) = tagResults(tag)
  def tagResults(tag: String): Action[AnyContent] =
    renderTagResults(DateMidnight.now, tag)

  def tagResultsForJson(year: String, month: String, day: String, tag: String) = tagResultsFor(year, month, day, tag)
  def tagResultsFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderTagResults(createDate(year, month, day), tag)

  private def renderTagResults(date: DateMidnight, tag: String): Action[AnyContent] = {
    lookupCompetition(tag).map { comp =>
      renderCompetitionResults(tag, comp, date)
    }.orElse {
      lookupTeam(tag).map(renderTeamResults(tag, _, date))
    }.getOrElse {
      Action(NotFound)
    }
  }

  private def renderCompetitionResults(competitionName: String, competition: Competition, date: DateMidnight) = Action { implicit request =>
    val results = new CompetitionResultsList(date, Competitions(), competition.id)
    val page = new Page(s"football/$competitionName/results", "football", s"${competition.fullName} results", "GFE:Football:automatic:competition results")
    renderMatchList(page, results)
  }

  private def renderTeamResults(teamName: String, team: FootballTeam, date: DateMidnight) = Action { implicit request =>
    val results = new TeamResultsList(date, Competitions(), team.id)
    val page = new Page(s"/football/$teamName/results", "football", s"${team.name} results", "GFE:Football:automatic:team results")
    renderMatchList(page, results)
  }
}
