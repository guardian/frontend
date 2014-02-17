package controllers.admin

import play.api._
import play.api.mvc._
import play.api.Play.current
import pa.{Player, TeamEventMatch}
import util.FutureZippers
import common.ExecutionContexts
import org.joda.time.DateMidnight
import java.net.URLDecoder
import football.services.{Client, GetPaClient}
import football.model.{PrevResult, PA}
import play.api.templates.Html
import scala.concurrent.Future
import model.{NoCache, Cached}


object TeamController extends Controller with ExecutionContexts with GetPaClient {

  def teamIndex = Authenticated { implicit request =>
    val teams = PA.teams.all
    Cached(60)(Ok(views.html.football.team.teamIndex(teams)))
  }

  def redirectToSquadPictures = Authenticated { request =>
    val submission = request.body.asFormUrlEncoded.get
    val teamId = submission.get("team").get.head
    NoCache(SeeOther(s"/admin/football/team/images/$teamId"))
  }

  def squadPictures(teamId: String) = Authenticated.async { request =>
    client.squad(teamId).map { squad =>
      val players = squad.map { squadMember =>
        Player(squadMember.playerId, teamId, squadMember.name)
      }
      Cached(60)(Ok(views.html.football.team.squadImages(teamId, players, PA.teams.all)))
    }
  }

  def redirectToTeamHead2Head = Authenticated { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val team1Id = submission.get("team1").get.head
    val team2Id = submission.get("team2").get.head
    NoCache(SeeOther(s"/admin/football/team/head2head/$team1Id/$team2Id"))
  }

  def teamHead2Head(team1Id: String, team2Id: String) = Authenticated.async { implicit request =>

    val premLeagueId = "100"

    FutureZippers.zip(
      client.teamHead2Head(team1Id, team2Id, new DateMidnight(2013, 7, 1), DateMidnight.now(), premLeagueId),
      client.teamResults(team1Id, new DateMidnight(2013, 7, 1)),
      client.teamResults(team2Id, new DateMidnight(2013, 7, 1))
    ).map { case ((team1H2H, team2H2H), team1Results, team2Results) =>
      Cached(60)(Ok(views.html.football.team.teamHead2head(
        team1H2H, team2H2H,
        team1Results.map(PrevResult(_, team1Id)),
        team2Results.map(PrevResult(_, team2Id))
      )))
    }
  }
}
