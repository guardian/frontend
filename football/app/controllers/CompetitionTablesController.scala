package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import play.api.libs.concurrent.Execution.Implicits._

object CompetitionTablesController extends Controller with Logging with CompetitionTableFilters {

  private def loadTable(competitionId: String): Option[Table] = Competitions.competitions
    .find(_.id == competitionId)
    .filter(_.hasLeagueTable)
    .map { Table(_).topOfTableSnippet }
    .filterNot(_.multiGroup) //Ensures eurpoean cups don't come through

  private def loadTableWithTeam(teamId: String): Option[Table] = Competitions.withTeam(teamId)
    .competitions
    .map { Table(_).snippetForTeam(teamId) }
    .filterNot(_.multiGroup)
    .headOption

  def renderCompetition() = Action { implicit request =>
    val competitionId = request.queryString("competitionId").headOption

    competitionId.map { id =>
      loadTable(id).map { table =>
        Cached(60) {
          val html = views.html.fragments.frontTableBlock(table)
          request.getQueryString("callback").map { callback =>
            JsonComponent(html)
          } getOrElse {
            Ok(Compressed(html))
          }
        }
      }.getOrElse(Cached(600)(NoContent))
    } getOrElse (BadRequest("need a competition id"))
  }

  def renderTeam(teamId: String) = Action { implicit request =>
    loadTableWithTeam(teamId).map { table =>
      Cached(60) {
        val html = views.html.fragments.frontTableBlock(table, Some(teamId))
        request.getQueryString("callback").map { callback =>
          JsonComponent(html)
        } getOrElse {
          Ok(Compressed(html))
        }
      }
    }.getOrElse(Cached(600)(NoContent))
  }
}
