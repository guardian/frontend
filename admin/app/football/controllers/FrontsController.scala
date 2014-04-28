package controllers.admin

import play.api.mvc.{Action, Controller, SimpleResult}
import play.api.libs.ws.WS
import play.api.templates.Html
import common.ExecutionContexts
import football.services.GetPaClient
import football.model.{SnapFields, PA}
import model.{NoCache, Cached}
import conf.Configuration
import scala.concurrent.Future
import pa.Season
import concurrent.FutureOpt


object FrontsController extends Controller with ExecutionContexts with GetPaClient {
  val SNAP_TYPE = "football"

  def index = Action.async { implicit request =>
    for {
      competitions <- client.competitions.map(PA.filterCompetitions)
    } yield {
      Cached(3600)(Ok(views.html.football.fronts.index(competitions)))
    }
  }

  def matchDay = Action.async { implicit request =>
    val snapFields = SnapFields(SNAP_TYPE, s"${Configuration.sport.apiUrl}/football/live.json", s"${Configuration.site.host}/football/live", "Live matches", "Today's matches")
    previewFrontsComponent(snapFields)
  }

  def resultsRedirect = Action { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val competitionId = submission.get("competition").get.head
    Cached(60)(SeeOther(s"/admin/football/fronts/results/$competitionId"))
  }

  def results(competitionId: String) = Action.async { implicit request =>
    val foResult =
      if ("all" == competitionId) {
        val snapFields = SnapFields(SNAP_TYPE, s"${Configuration.sport.apiUrl}/football/results.json", s"${Configuration.site.host}/football/results", "Results", "View the full results from today's matches")
        FutureOpt.fromFuture(previewFrontsComponent(snapFields))
      } else {
        for {
          season <- getCompetition(competitionId)
          competitionName = PA.competitionName(season)
          snapFields = SnapFields(SNAP_TYPE, s"${Configuration.sport.apiUrl}/football/$competitionId/results.json", s"${Configuration.site.host}/football/results", s"$competitionName results", s"View the full results from today's $competitionName matches")
          previewContent <- FutureOpt.fromFuture(previewFrontsComponent(snapFields))
        } yield previewContent
      }
    foResult.getOrElse(throw new RuntimeException(s"Competition $competitionId not found"))
  }

  def fixturesRedirect = Action { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val competitionId = submission.get("competition").get.head
    Cached(60)(SeeOther(s"/admin/football/fronts/fixtures/$competitionId"))
  }

  def fixtures(competitionId: String) = Action.async { implicit request =>
    val foResult =
      if ("all" == competitionId) {
        val snapFields = SnapFields(SNAP_TYPE, s"${Configuration.sport.apiUrl}/football/fixtures.json", s"${Configuration.site.host}/football/fixtures", "Upcoming fixtures", "See which teams are up against each other")
        FutureOpt.fromFuture(previewFrontsComponent(snapFields))
      } else {
        for {
          season <- getCompetition(competitionId)
          competitionName = PA.competitionName(season)
          snapFields = SnapFields(SNAP_TYPE, s"${Configuration.sport.apiUrl}/football/$competitionId/fixtures.json", s"${Configuration.site.host}/football/fixtures", s"$competitionName upcoming fixtures", s"See which $competitionName teams are up against each other")
          previewContent <- FutureOpt.fromFuture(previewFrontsComponent(snapFields))
        } yield previewContent
      }
    foResult.getOrElse(throw new RuntimeException(s"Competition $competitionId not found"))
  }

  def tablesRedirect = Action { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val competitionId = submission.get("competition").get.head
    Cached(60)(SeeOther(s"/admin/football/fronts/tables/$competitionId"))
  }

  def tables(competitionId: String) = Action.async { implicit request =>
    val foResult =
      for {
        season <- getCompetition(competitionId)
        competitionName = PA.competitionName(season)
        snapFields = SnapFields(SNAP_TYPE, s"${Configuration.sport.apiUrl}/football/$competitionId/table.json", s"${Configuration.site.host}/football/tables", s"$competitionName table", s"View the full standing for the $competitionName")
        previewContent <- FutureOpt.fromFuture(previewFrontsComponent(snapFields))
      } yield previewContent
    foResult.getOrElse(throw new RuntimeException(s"Competition $competitionId not found"))
  }

  private def getCompetition(competitionId: String): FutureOpt[Season] = {
    FutureOpt {
      for {
        competitionOpt <- client.competitions.map(PA.filterCompetitions(_).find(_.competitionId == competitionId))
      } yield competitionOpt
    }
  }

  private def previewFrontsComponent(snapFields: SnapFields): Future[SimpleResult] = {
    val result = (for {
      previewResponse <- WS.url(snapFields.uri).get()
    } yield {
      val embedContent = (previewResponse.json \ "html").as[String]
      Cached(60)(Ok(views.html.football.fronts.viewEmbed(Html(embedContent), snapFields)))
    }).recover { case e =>
      NoCache(Ok(views.html.football.fronts.failedEmbed(Html(e.getMessage), snapFields)))
    }
    result
  }
}
