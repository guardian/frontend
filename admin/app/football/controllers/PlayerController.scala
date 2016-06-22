package controllers.admin

import model.Cached.RevalidatableResult
import play.api.mvc._
import football.services.GetPaClient
import pa.{StatsSummary, PlayerProfile, PlayerAppearances}
import implicits.Requests
import common.{JsonComponent, ExecutionContexts}
import org.joda.time.LocalDate
import football.model.PA
import scala.concurrent.Future
import model.{Cors, NoCache, Cached}
import play.api.libs.json.{JsString, JsArray, JsObject}
import org.joda.time.format.DateTimeFormat
import play.twirl.api.HtmlFormat


class PlayerController extends Controller with ExecutionContexts with GetPaClient with Requests {

  def playerIndex = AuthActions.AuthActionTest.async { implicit request =>
    for {
      competitions <- client.competitions.map(PA.filterCompetitions)
      competitionTeams <- Future.traverse(competitions){comp => client.teams(comp.competitionId, comp.startDate, comp.endDate)}
      allTeams = competitionTeams.flatten.distinct
    } yield {
      Cached(600)(RevalidatableResult.Ok(views.html.football.player.playerIndex(competitions, allTeams)))
    }
  }

  def redirectToCard = AuthActions.AuthActionTest { request =>
    val submission = request.body.asFormUrlEncoded.get
    val playerCardType = submission.get("playerCardType").get.head
    val playerId = submission.get("player").get.head
    val teamId = submission.get("team").get.head
    val result = (submission.get("competition"), submission.get("startDate")) match {
      case (Some(Seq(compId)), _) if !compId.isEmpty =>
        NoCache(SeeOther(s"/admin/football/player/card/competition/$playerCardType/$playerId/$teamId/$compId"))
      case (_, Some(Seq(startDate))) =>
        NoCache(SeeOther(s"/admin/football/player/card/date/$playerCardType/$playerId/$teamId/$startDate"))
      case _ => NoCache(NotFound(views.html.football.error("Couldn't find competition or start date in submission")))
    }
    result
  }
  def playerCardCompetitionJson(cardType: String, playerId: String, teamId: String, competitionId: String)
        = playerCardCompetition(cardType, playerId, teamId, competitionId)

  def playerCardCompetition(cardType: String, playerId: String, teamId: String, competitionId: String) =AuthActions.AuthActionTest.async { implicit request =>
    client.competitions.map(PA.filterCompetitions).flatMap { competitions =>
      competitions.find(_.competitionId == competitionId).fold(Future.successful(NoCache(NotFound(views.html.football.error(s"Competition $competitionId not found"))))) { competition =>
        for {
          playerProfile <- client.playerProfile(playerId)
          playerStats <- client.playerStats(playerId, competition.startDate, LocalDate.now(), teamId, competitionId)
          playerAppearances <- client.appearances(playerId, competition.startDate, LocalDate.now(), teamId, competitionId)
        } yield {
          val result = createPlayerCard(cardType, playerId, playerProfile, playerStats, playerAppearances)
          result.map(renderPlayerCard).getOrElse(renderNotFound)
        }
      }
    }
  }

  def playerCardDateJson(cardType: String, playerId: String, teamId: String, startDateStr: String)
      = playerCardDate(cardType, playerId, teamId, startDateStr)


  def playerCardDate(cardType: String, playerId: String, teamId: String, startDateStr: String) = AuthActions.AuthActionTest.async { implicit request =>
    val startDate = LocalDate.parse(startDateStr, DateTimeFormat.forPattern("yyyyMMdd"))
    for {
      playerProfile <- client.playerProfile(playerId)
      playerStats <- client.playerStats(playerId, startDate, LocalDate.now(), teamId)
      playerAppearances <- client.appearances(playerId, startDate, LocalDate.now(), teamId)
    } yield {
      val result = createPlayerCard(cardType, playerId, playerProfile, playerStats, playerAppearances)
      result.map(renderPlayerCard).getOrElse(renderNotFound)
    }
  }

  private def renderPlayerCard(card: HtmlFormat.Appendable)(implicit request: RequestHeader) = {
    if(!request.isJson) Cors(NoCache(Ok(card)))
    else NoCache {
      JsonComponent(
          "html" -> card
      ).result
    }
  }

  private def renderNotFound()(implicit request: RequestHeader) = {
    if(!request.isJson) Cors(NotFound(views.html.football.error("Unknown card type")))
    else NotFound
  }

  private def createPlayerCard(cardType: String, playerId: String, playerProfile: PlayerProfile, playerStats: StatsSummary, playerAppearances: PlayerAppearances):
    Option[HtmlFormat.Appendable] = {
    cardType match {
      case "attack" => Some(views.html.football.player.cards.attack(playerId, playerProfile, playerStats, playerAppearances))
      case "assist" => Some(views.html.football.player.cards.assist(playerId, playerProfile, playerStats, playerAppearances))
      case "discipline" => Some(views.html.football.player.cards.discipline(playerId, playerProfile, playerStats, playerAppearances))
      case "defence" => Some(views.html.football.player.cards.defence(playerId, playerProfile, playerStats, playerAppearances))
      case "goalkeeper" => Some(views.html.football.player.cards.goalkeeper(playerId, playerProfile, playerStats, playerAppearances))
      case _ => None
    }
  }

  def squad(teamId: String) =AuthActions.AuthActionTest.async { implicit request =>
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
