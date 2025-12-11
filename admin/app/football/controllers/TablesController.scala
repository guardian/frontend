package controllers.admin

import common.{ImplicitControllerExecutionContext, GuLogging}
import football.model.PA
import football.services.PaFootballClient
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, Cors, NoCache}
import java.time.LocalDate
import pa._
import play.api.mvc._
import play.api.libs.ws.WSClient

import scala.concurrent.Future

class TablesController(val wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit
    val context: ApplicationContext,
) extends BaseController
    with ImplicitControllerExecutionContext
    with PaFootballClient
    with GuLogging {

  def tablesIndex: Action[AnyContent] =
    Action.async { implicit request =>
      for {
        allCompetitions <- client.competitions
      } yield {
        val filteredCompetitions = PA.filterCompetitions(allCompetitions)
        Cached(60)(
          RevalidatableResult.Ok(views.html.football.leagueTables.tablesIndex(filteredCompetitions, PA.teams.all)),
        )
      }
    }

  def redirectToTable: Action[AnyContent] =
    Action { implicit request =>
      val submission = request.body.asFormUrlEncoded.get
      val competitionId = submission.get("competitionId").get.head
      val url = submission.get("focus").get.head match {
        case "top"    => s"/admin/football/tables/league/$competitionId/top"
        case "bottom" => s"/admin/football/tables/league/$competitionId/bottom"
        case "team"   =>
          val teamId = submission.get("teamId").get.head
          submission.get("team2Id") match {
            case Some(Seq(team2Id)) if !team2Id.startsWith("Choose") =>
              s"/admin/football/tables/league/$competitionId/$teamId/$team2Id"
            case _ => s"/admin/football/tables/league/$competitionId/$teamId"
          }
        case _ =>
          submission
            .get("group")
            .flatMap(_.filterNot(_.isEmpty).headOption)
            .fold(s"/admin/football/tables/league/$competitionId")(group =>
              s"/admin/football/tables/league/$competitionId/$group",
            )

      }
      NoCache(SeeOther(url))
    }

  def leagueTableFragment(competitionId: String, focus: String): Action[AnyContent] =
    Action.async { implicit request =>
      client.competitions.map(PA.filterCompetitions(_).find(_.competitionId == competitionId)).flatMap { seasonOpt =>
        seasonOpt.fold(
          Future
            .successful(Cors(NoCache(InternalServerError(views.html.football.error("Please provide a valid league"))))),
        ) { season =>
          client.leagueTable(season.competitionId, LocalDate.now()).map { tableEntries =>
            val entries = focus match {
              case "top"                               => tableEntries.take(5)
              case "bottom"                            => tableEntries.takeRight(5)
              case "none"                              => tableEntries
              case group if group.startsWith("group-") =>
                tableEntries.filter(_.round.name.fold(false)(_.toLowerCase.replace(' ', '-') == group))
              case teamId => surroundingItems[LeagueTableEntry](2, tableEntries, _.team.id == teamId)
            }
            Cors(NoCache(Ok(views.html.football.leagueTables.leagueTable(season, entries, List(focus)))))
          }
        }
      }
    }

  def leagueTable2Teams(competitionId: String, team1Id: String, team2Id: String): Action[AnyContent] =
    Action.async { implicit request =>
      client.competitions.map(PA.filterCompetitions(_).find(_.competitionId == competitionId)).flatMap { seasonOpt =>
        seasonOpt.fold(
          Future.successful(NoCache(InternalServerError(views.html.football.error("Please provide a valid league")))),
        ) { season =>
          client.leagueTable(season.competitionId, LocalDate.now()).map { tableEntries =>
            val aroundTeam1 = surroundingItems[LeagueTableEntry](1, tableEntries, _.team.id == team1Id)
            val aroundTeam2 = surroundingItems[LeagueTableEntry](1, tableEntries, _.team.id == team2Id)
            val entries = {
              if (aroundTeam1(0).team.rank < aroundTeam2(0).team.rank)
                (aroundTeam1 ++ aroundTeam2).distinct
              else
                (aroundTeam2 ++ aroundTeam1).distinct
            }
            Cors(NoCache(Ok(views.html.football.leagueTables.leagueTable(season, entries, List(team1Id, team2Id)))))
          }
        }
      }
    }

  def leagueTable(competitionId: String): Action[AnyContent] =
    Action.async { implicit request =>
      client.competitions.map(PA.filterCompetitions(_).find(_.competitionId == competitionId)).flatMap { seasonOpt =>
        seasonOpt.fold(
          Future
            .successful(Cors(NoCache(InternalServerError(views.html.football.error("Please provide a valid league"))))),
        ) { season =>
          client.leagueTable(season.competitionId, LocalDate.now()).map { tableEntries =>
            Cors(NoCache(Ok(views.html.football.leagueTables.leagueTable(season, tableEntries))))
          }
        }
      }
    }

  def surroundingItems[T](surroundingNumber: Int, items: List[T], equal: (T) => Boolean): List[T] = {
    val before = items.takeWhile(!equal(_))
    val after = items.reverse.takeWhile(!equal(_)).reverse
    val item = items.find(equal).get
    before.takeRight(surroundingNumber) ++ List(item) ++ after.take(surroundingNumber)
  }
}
