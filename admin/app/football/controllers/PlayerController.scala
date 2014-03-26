package controllers.admin

import play.api.mvc._
import football.services.{GetPaClient}
import pa.{PlayerProfile}
import util.FutureZippers
import common.ExecutionContexts
import org.joda.time.DateMidnight
import football.model.{PA}
import scala.concurrent.Future
import model.{Cors, NoCache, Cached}


object PlayerController extends Controller with ExecutionContexts with GetPaClient {

  def playerIndex = Authenticated.async { request =>
    Future.sequence(PA.teams.prem.map { case (teamId, name) =>
      client.squad(teamId)
    }).map { teamSquads =>
      val players = teamSquads.flatten.sortBy(_.name)
      Cached(60)(Ok(views.html.football.player.playerIndex(players)))
    }
  }

  def redirectToCard = Authenticated { request =>
    val submission = request.body.asFormUrlEncoded.get
    val playerId = submission.get("player").get.head
    val playerCardType = submission.get("playerCardType").get.head
    NoCache(SeeOther(s"/admin/football/player/card/$playerCardType/$playerId"))
  }

  def playerCard(playerId: String, cardType: String) = {
    Authenticated.async { implicit request =>
      FutureZippers.zip(
        client.playerProfile(playerId),
        client.playerStats(playerId, new DateMidnight(2013, 7, 1), DateMidnight.now()),
        client.appearances(playerId, new DateMidnight(2013, 7, 1), DateMidnight.now())
      ).map { case (playerProfile, playerStats, playerAppearances) =>
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
  }

  def redirectToHead2Head = Authenticated { request =>
    val submission = request.body.asFormUrlEncoded.get
    val player1Id = submission.get("player1").get.head
    val player2Id = submission.get("player2").get.head
    NoCache(SeeOther(s"/admin/football/player/head2head/$player1Id/$player2Id"))
  }

  def head2Head(player1Id: String, player2Id: String) = Authenticated.async { request =>
    FutureZippers.zip(
      client.playerHead2Head(player1Id, player2Id, new DateMidnight(2013, 7, 1), DateMidnight.now()),
      client.appearances(player1Id, new DateMidnight(2013, 7, 1), DateMidnight.now()),
      client.appearances(player2Id, new DateMidnight(2013, 7, 1), DateMidnight.now())
    ).map { case ((player1h2h, player2h2h), player1Appearances, player2Appearances) =>
      Cached(60)(Ok(views.html.football.player.playerHead2Head(player1h2h, player2h2h, player1Appearances, player2Appearances)))
    }
  }
}
