package controllers.admin

import play.api._
import play.api.mvc._
import play.api.Play.current
import pa._
import util.FutureZippers
import common.ExecutionContexts
import org.joda.time.DateMidnight
import java.net.URLDecoder
import model.football.{PrevResult, PA}
import play.api.templates.Html
import scala.concurrent.Future
import services.football.GetPaClient


object TablesController extends Controller with ExecutionContexts with GetPaClient {

  def tablesIndex = Authenticated { request =>
    Ok(views.html.football.leagueTables.tablesIndex(PA.competitions, PA.teams.all))
  }

  def redirectToTable = Authenticated { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val competitionId = submission.get("competitionId").get.head
    submission.get("focus").get.head match {
      case "top" => SeeOther(s"/admin/football/tables/league/$competitionId/top")
      case "bottom" => SeeOther(s"/admin/football/tables/league/$competitionId/bottom")
      case "team" =>
        val teamId = submission.get("teamId").get.head
        SeeOther(s"/admin/football/tables/league/$competitionId/$teamId")
      case _ => SeeOther(s"/admin/football/tables/league/$competitionId")
    }
  }

  def leagueTableFragment(competitionId: String, focus: String) = Authenticated.async { request =>
    PA.competitions.find(_.competitionId == competitionId).map { league =>
      client.leagueTable(league.competitionId, DateMidnight.now()).map { tableEntries =>
        val entries = focus match {
          case "top" => tableEntries.take(5)
          case "bottom" => tableEntries.reverse.take(5).reverse
          case "none" => tableEntries
          case teamId =>
            val before = tableEntries.takeWhile(_.team.id != teamId)
            val after = tableEntries.reverse.takeWhile(_.team.id != teamId).reverse
            val team = tableEntries.find(_.team.id == teamId).get
            before.reverse.take(2).reverse ++ List(team) ++ after.take(2)
        }
        Ok(views.html.football.leagueTables.leagueTable(league, entries, focus))
      }
    } getOrElse Future.successful(InternalServerError(views.html.football.error("Please provide a valid league")))
  }

  def leagueTable(competitionId: String) = Authenticated.async { request =>
    PA.competitions.find(_.competitionId == competitionId).map { league =>
      client.leagueTable(league.competitionId, DateMidnight.now()).map { tableEntries =>
        Ok(views.html.football.leagueTables.leagueTable(league, tableEntries))
      }
    } getOrElse Future.successful(InternalServerError(views.html.football.error("Please provide a valid league")))
  }
}
