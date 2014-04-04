package controllers.admin

import play.api.mvc._
import football.services.{GetPaClient}
import pa.{PlayerProfile}
import common.{JsonComponent, ExecutionContexts}
import org.joda.time.DateMidnight
import football.model.{PA}
import scala.concurrent.Future
import model.{Cors, NoCache, Cached}
import com.gu.management.JsonResponse
import play.api.libs.Jsonp
import play.api.libs.json.{JsString, JsArray, JsObject}


object PlayerController extends Controller with ExecutionContexts with GetPaClient {

  def playerIndex = Authenticated.async { request =>
    for {
      competitions <- client.competitions.map(PA.filterCompetitions)
      competitionTeams <- Future.traverse(competitions){comp => client.teams(comp.competitionId, comp.startDate, comp.endDate)}
      allTeams = competitionTeams.flatten.distinct
    } yield {
      Cached(600)(Ok(views.html.football.player.playerIndex(competitions, allTeams)))
    }
  }

  def redirectToCard = Authenticated { request =>
    val submission = request.body.asFormUrlEncoded.get
    val playerId = submission.get("player").get.head
    val teamId = submission.get("team").get.head
    val compId = submission.get("competition").get.head
    val playerCardType = submission.get("playerCardType").get.head
    NoCache(SeeOther(s"/admin/football/player/card/$playerCardType/$playerId/$teamId/$compId"))
  }

  def playerCard(playerId: String, teamId: String, competitionId: String, cardType: String) = Authenticated.async { implicit request =>
    for {
      competitions <- client.competitions.map(PA.filterCompetitions)
      competition = competitions.find(_.competitionId == competitionId).getOrElse(throw new RuntimeException("Competition not found"))
      playerProfile <- client.playerProfile(playerId)
      playerStats <- client.playerStats(playerId, competition.startDate, DateMidnight.now(), teamId, competitionId)
      playerAppearances <- client.appearances(playerId, competition.startDate, DateMidnight.now(), teamId, competitionId)
    } yield {
      val result = cardType match {
        case "attack" => Ok(views.html.football.player.cards.attack(playerId: String, playerProfile: PlayerProfile, playerStats, playerAppearances))
        case "assist" => Ok(views.html.football.player.cards.assist(playerId: String, playerProfile: PlayerProfile, playerStats, playerAppearances))
        case "discipline" => Ok(views.html.football.player.cards.discipline(playerId: String, playerProfile: PlayerProfile, playerStats, playerAppearances))
        case "defence" => Ok(views.html.football.player.cards.defence(playerId: String, playerProfile: PlayerProfile, playerStats, playerAppearances))
        case "goalkeeper" => Ok(views.html.football.player.cards.goalkeeper(playerId: String, playerProfile: PlayerProfile, playerStats, playerAppearances))
        case "overview" => Ok(views.html.football.player.cards.overview(playerId: String, playerStats, playerAppearances))
        case _ => Ok(views.html.football.player.cards.overview(playerId: String, playerStats, playerAppearances))
      }
      Cors(NoCache(result))
    }
  }

  def redirectToHead2Head = Authenticated { request =>
    val submission = request.body.asFormUrlEncoded.get
    val player1Id = submission.get("player1").get.head
    val player2Id = submission.get("player2").get.head
    NoCache(SeeOther(s"/admin/football/player/head2head/$player1Id/$player2Id"))
  }

  def head2Head(player1Id: String, player2Id: String) = Authenticated.async { request =>
    for {
      (player1h2h, player2h2h) <- client.playerHead2Head(player1Id, player2Id, new DateMidnight(2013, 7, 1), DateMidnight.now())
      player1Appearances <- client.appearances(player1Id, new DateMidnight(2013, 7, 1), DateMidnight.now())
      player2Appearances <- client.appearances(player2Id, new DateMidnight(2013, 7, 1), DateMidnight.now())
    } yield {
      Cached(60)(Ok(views.html.football.player.playerHead2Head(player1h2h, player2h2h, player1Appearances, player2Appearances)))
    }
  }

  def squad(teamId: String) = Authenticated.async { implicit request =>
    for {
      squad <- client.squad(teamId)
    } yield {
      val responseJson = JsObject(Seq("players" -> JsArray(
        squad.map { squadMember =>
          JsObject(Seq(
            "label" -> JsString(squadMember.name),
            "value" -> JsString(squadMember.playerId)
          ))
        }
      )))
      Cached(600)(JsonComponent(responseJson))
    }
  }
}
