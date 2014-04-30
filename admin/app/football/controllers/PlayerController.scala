package controllers.admin

import play.api.mvc._
import football.services.GetPaClient
import pa.{StatsSummary, PlayerProfile, PlayerAppearances}
import common.{JsonComponent, ExecutionContexts}
import org.joda.time.DateMidnight
import football.model.PA
import scala.concurrent.Future
import model.{Cors, NoCache, Cached}
import com.gu.management.JsonResponse
import play.api.libs.Jsonp
import play.api.libs.json.{JsString, JsArray, JsObject}
import org.joda.time.format.DateTimeFormat


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
    val playerCardType = submission.get("playerCardType").get.head
    val playerId = submission.get("player").get.head
    val teamId = submission.get("team").get.head
    println(s"startDate: ${submission.get("startDate")}, comp: ${submission.get("competition")}")
    val redirectUrl = (submission.get("competition"), submission.get("startDate")) match {
      case (Some(compId :: _), _) if !compId.isEmpty =>
        println(s"comp: $compId")
        s"/admin/football/player/card/competition/$playerCardType/$playerId/$teamId/$compId"
      case (_, Some(startDate:: _)) =>
        println(s"startDate: $startDate")
        s"/admin/football/player/card/date/$playerCardType/$playerId/$teamId/$startDate"
      case _ => throw new RuntimeException("Couldn't find competition or start date in submission")
    }
    NoCache(SeeOther(redirectUrl))
  }

  def playerCardCompetition(cardType: String, playerId: String, teamId: String, competitionId: String) = Authenticated.async { implicit request =>
    for {
      competitions <- client.competitions.map(PA.filterCompetitions)
      competition = competitions.find(_.competitionId == competitionId).getOrElse(throw new RuntimeException("Competition not found"))
      playerProfile <- client.playerProfile(playerId)
      playerStats <- client.playerStats(playerId, competition.startDate, DateMidnight.now(), teamId, competitionId)
      playerAppearances <- client.appearances(playerId, competition.startDate, DateMidnight.now(), teamId, competitionId)
    } yield {
      val result = renderPlayerCard(cardType, playerId, playerProfile, playerStats, playerAppearances)
      Cors(NoCache(result))
    }
  }

  def playerCardDate(cardType: String, playerId: String, teamId: String, startDateStr: String) = Authenticated.async { implicit request =>
    val startDate = DateMidnight.parse(startDateStr, DateTimeFormat.forPattern("yyyyMMdd"))
    for {
      playerProfile <- client.playerProfile(playerId)
      playerStats <- client.playerStats(playerId, startDate, DateMidnight.now(), teamId)
      playerAppearances <- client.appearances(playerId, startDate, DateMidnight.now(), teamId)
    } yield {
      val result = renderPlayerCard(cardType, playerId, playerProfile, playerStats, playerAppearances)
      Cors(NoCache(result))
    }
  }

  private def renderPlayerCard(cardType: String, playerId: String, playerProfile: PlayerProfile, playerStats: StatsSummary, playerAppearances: PlayerAppearances) = {
    cardType match {
      case "attack" => Ok(views.html.football.player.cards.attack(playerId, playerProfile, playerStats, playerAppearances))
      case "assist" => Ok(views.html.football.player.cards.assist(playerId, playerProfile, playerStats, playerAppearances))
      case "discipline" => Ok(views.html.football.player.cards.discipline(playerId, playerProfile, playerStats, playerAppearances))
      case "defence" => Ok(views.html.football.player.cards.defence(playerId, playerProfile, playerStats, playerAppearances))
      case "goalkeeper" => Ok(views.html.football.player.cards.goalkeeper(playerId, playerProfile, playerStats, playerAppearances))
      case _ => throw new RuntimeException("Unknown card type")
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
