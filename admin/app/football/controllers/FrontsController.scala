package controllers.admin

import play.api.mvc.{Action, Controller}
import play.api.libs.ws.WS
import play.api.templates.Html
import common.ExecutionContexts
import football.services.GetPaClient
import football.model.PA
import model.Cached
import conf.Configuration

object FrontsController extends Controller with ExecutionContexts with GetPaClient {
  def index = Action.async { implicit request =>
    for {
      competitions <- client.competitions.map(PA.filterCompetitions)
    } yield {
      Cached(3600)(Ok(views.html.football.fronts.index(competitions)))
    }
  }

  def matchDay = Action.async { implicit request =>
    val url = s"${Configuration.sport.apiUrl}/football/live.json"
    WS.url(url).get().map { response =>
      val embedContent = (response.json \ "html").as[String]
      Cached(60)(Ok(views.html.football.fronts.viewEmbed(url, "Live matches", Html(embedContent))))
    }
  }

  def resultsRedirect = Action { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val competitionId = submission.get("competition").get.head
    Cached(60)(SeeOther(s"/admin/football/fronts/results/$competitionId"))
  }

  def results(competition: String) = Action.async { implicit request =>
    val url =
      if ("all" == competition) s"${Configuration.sport.apiUrl}/football/results.json"
      else s"${Configuration.sport.apiUrl}/football/$competition/results.json"
    WS.url(url).get().map { response =>
      val embedContent = (response.json \ "html").as[String]
      Cached(60)(Ok(views.html.football.fronts.viewEmbed(url, "Results", Html(embedContent))))
    }
  }

  def fixturesRedirect = Action { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val competitionId = submission.get("competition").get.head
    Cached(60)(SeeOther(s"/admin/football/fronts/fixtures/$competitionId"))
  }

  def fixtures(competition: String) = Action.async { implicit request =>
    val url =
      if ("all" == competition) s"${Configuration.sport.apiUrl}/football/fixtures.json"
      else s"${Configuration.sport.apiUrl}/football/$competition/fixtures.json"
    WS.url(url).get().map { response =>
      val embedContent = (response.json \ "html").as[String]
      Cached(60)(Ok(views.html.football.fronts.viewEmbed(url, "Fixtures", Html(embedContent))))
    }
  }

  def tablesRedirect = Action { implicit request =>
    val submission = request.body.asFormUrlEncoded.get
    val competitionId = submission.get("competition").get.head
    Cached(60)(SeeOther(s"/admin/football/fronts/tables/$competitionId"))
  }

  def tables(competition: String) = Action.async { implicit request =>
    val url = s"${Configuration.sport.apiUrl}/football/$competition/table.json"
    WS.url(url).get().map { response =>
      val embedContent = (response.json \ "html").as[String]
      Cached(60)(Ok(views.html.football.fronts.viewEmbed(url, "Table", Html(embedContent))))
    }
  }
}
