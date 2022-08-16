package controllers.admin

import model.Cached.RevalidatableResult
import play.api.mvc._
import football.services.PaFootballClient
import pa.{PlayerAppearances, PlayerProfile, StatsSummary}
import implicits.Requests
import common.{GuLogging, ImplicitControllerExecutionContext, JsonComponent}

import java.time.LocalDate
import football.model.PA

import scala.concurrent.Future
import model.{ApplicationContext, Cached, Cors, NoCache}
import play.api.libs.json.{JsArray, JsObject, JsString}
import play.twirl.api.HtmlFormat
import play.api.libs.ws.WSClient

import java.time.format.DateTimeFormatter

class PlayerController(val wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit
    val context: ApplicationContext,
) extends BaseController
    with ImplicitControllerExecutionContext
    with PaFootballClient
    with Requests
    with GuLogging {

  def playerIndex: Action[AnyContent] =
    Action.async { implicit request =>
      fetchCompetitionsAndTeams.map {
        case (competitions, teams) =>
          Cached(600)(RevalidatableResult.Ok(views.html.football.player.playerIndex(competitions, teams)))
      }
    }

  def redirectToCard: Action[AnyContent] =
    Action { implicit request =>
      val submission = request.body.asFormUrlEncoded.get
      val playerCardType = submission("playerCardType").head
      val playerId = submission("player").head
      val teamId = submission("team").head
      val result = (submission.get("competition"), submission.get("startDate")) match {
        case (Some(Seq(compId)), _) if !compId.isEmpty =>
          NoCache(SeeOther(s"/admin/football/player/card/competition/$playerCardType/$playerId/$teamId/$compId"))
        case (_, Some(Seq(startDate))) =>
          NoCache(SeeOther(s"/admin/football/player/card/date/$playerCardType/$playerId/$teamId/$startDate"))
        case _ => NoCache(NotFound(views.html.football.error("Couldn't find competition or start date in submission")))
      }
      result
    }
  def playerCardCompetitionJson(
      cardType: String,
      playerId: String,
      teamId: String,
      competitionId: String,
  ): Action[AnyContent] = playerCardCompetition(cardType, playerId, teamId, competitionId)

  def playerCardCompetition(
      cardType: String,
      playerId: String,
      teamId: String,
      competitionId: String,
  ): Action[AnyContent] =
    Action.async { implicit request =>
      client.competitions.map(PA.filterCompetitions).flatMap { competitions =>
        competitions
          .find(_.competitionId == competitionId)
          .fold(
            Future.successful(NoCache(NotFound(views.html.football.error(s"Competition $competitionId not found")))),
          ) { competition =>
            for {
              playerProfile <- client.playerProfile(playerId)
              playerStats <- client.playerStats(playerId, competition.startDate, LocalDate.now(), teamId, competitionId)
              playerAppearances <-
                client.appearances(playerId, competition.startDate, LocalDate.now(), teamId, competitionId)
            } yield {
              val result = createPlayerCard(cardType, playerId, playerProfile, playerStats, playerAppearances)
              result.map(renderPlayerCard).getOrElse(renderNotFound())
            }
          }
      }
    }

  def playerCardDateJson(cardType: String, playerId: String, teamId: String, startDateStr: String): Action[AnyContent] =
    playerCardDate(cardType, playerId, teamId, startDateStr)

  def playerCardDate(cardType: String, playerId: String, teamId: String, startDateStr: String): Action[AnyContent] =
    Action.async { implicit request =>
      val startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ofPattern("yyyyMMdd"))
      for {
        playerProfile <- client.playerProfile(playerId)
        playerStats <- client.playerStats(playerId, startDate, LocalDate.now(), teamId)
        playerAppearances <- client.appearances(playerId, startDate, LocalDate.now(), teamId)
      } yield {
        val result = createPlayerCard(cardType, playerId, playerProfile, playerStats, playerAppearances)
        result.map(renderPlayerCard).getOrElse(renderNotFound())
      }
    }

  private def renderPlayerCard(card: HtmlFormat.Appendable)(implicit request: RequestHeader) = {
    if (!request.isJson) Cors(NoCache(Ok(card)))
    else
      NoCache {
        JsonComponent(card).result
      }
  }

  private def renderNotFound()(implicit request: RequestHeader) = {
    if (!request.isJson) Cors(NotFound(views.html.football.error("Unknown card type")))
    else NotFound
  }

  private def createPlayerCard(
      cardType: String,
      playerId: String,
      playerProfile: PlayerProfile,
      playerStats: StatsSummary,
      playerAppearances: PlayerAppearances,
  )(implicit request: RequestHeader): Option[HtmlFormat.Appendable] = {
    cardType match {
      case "attack" =>
        Some(views.html.football.player.cards.attack(playerId, playerProfile, playerStats, playerAppearances))
      case "assist" =>
        Some(views.html.football.player.cards.assist(playerId, playerProfile, playerStats, playerAppearances))
      case "discipline" =>
        Some(views.html.football.player.cards.discipline(playerId, playerProfile, playerStats, playerAppearances))
      case "defence" =>
        Some(views.html.football.player.cards.defence(playerId, playerProfile, playerStats, playerAppearances))
      case "goalkeeper" =>
        Some(views.html.football.player.cards.goalkeeper(playerId, playerProfile, playerStats, playerAppearances))
      case _ => None
    }
  }

  def squad(teamId: String): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        squad <- client.squad(teamId)
      } yield {
        val responseJson = JsObject(
          Seq(
            "players" -> JsArray(
              squad.map { squadMember =>
                JsObject(
                  Seq(
                    "label" -> JsString(squadMember.name),
                    "value" -> JsString(squadMember.playerId),
                  ),
                )
              },
            ),
          ),
        )
        Cached(600)(JsonComponent.fromWritable(responseJson))
      }
    }
}
