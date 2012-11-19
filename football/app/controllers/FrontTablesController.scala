package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import play.api.templates.Html
import pa.{ Round, LeagueTableEntry }

object FrontTablesController extends Controller with Logging with CompetitionTableFilters {

  private def loadTables: Seq[Table] = Competitions.competitions.filter(_.hasLeagueTable).map { comp =>
    val groups = comp.leagueTable
      .groupBy(_.round)
      .map { case (round, table) => Group(round, table) }
      .toSeq.sortBy(_.round.map(_.roundNumber).getOrElse(""))
    Table(comp, groups)
  }

  def render() = Action { implicit request =>
    val competitionIds = request.queryString("competitionId")
    val competitions = Competitions.competitions

    //keep competitions in same order as passed in ids
    val competition = competitionIds.flatMap(id => competitions.find(_.id == id)).headOption

    loadTables.find(_.competition.id == competition.map(_.id).getOrElse("-1")).map { table =>

      Cached(60) {
        val html = views.html.fragments.frontTableBlock(table)
        request.getQueryString("callback").map { callback =>
          JsonComponent(html)
        } getOrElse {
          Cached(60) {
            Ok(Compressed(html))
          }
        }
      }
    } getOrElse (NoContent)

  }
}
