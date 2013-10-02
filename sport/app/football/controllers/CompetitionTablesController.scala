package football.controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._


object CompetitionTablesController extends Controller with Logging with CompetitionTableFilters with ExecutionContexts {

  private def loadTable(competitionId: String): Option[Table] = Competitions.competitions
    .find(_.id == competitionId)
    .filter(_.hasLeagueTable)
    .map { Table(_).topOfTableSnippet }
    .filterNot(_.multiGroup) //Ensures European cups don't come through

  private def loadTableWithTeam(teamId: String): Option[Table] = Competitions.withTeam(teamId)
    .competitions
    .map { Table(_).snippetForTeam(teamId) }
    .filterNot(_.multiGroup)
    .headOption

  def renderCompetitionJson() = renderCompetition()
  def renderCompetition() = Action { implicit request =>
    val competitionId = request.queryString("competitionId").headOption

    competitionId.map { id =>
      loadTable(id).map { table =>
        val html = () => football.views.html.fragments.frontTableBlock(table)
        renderFormat(html, html, 60)
      }.getOrElse(Cached(600)(NoContent))
    } getOrElse BadRequest("need a competition id")
  }

  def renderTeamJson(teamId: String) = renderTeam(teamId)
  def renderTeam(teamId: String) = Action { implicit request =>
    loadTableWithTeam(teamId).map { table =>
      val html = () => football.views.html.fragments.frontTableBlock(table, Some(teamId))
      renderFormat(html, html, 60)
    }.getOrElse(Cached(600)(NoContent))
  }
}
