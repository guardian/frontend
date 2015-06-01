package controllers

import common.ExecutionContexts
import frontpress.LiveFapiFrontPress
import conf.Configuration
import frontpress.FrontPress
import model.NoCache
import play.api.libs.json.Json
import play.api.mvc.{Result, Action, Controller}
import services.ConfigAgent
import conf.Switches.FaciaPressOnDemand

import scala.concurrent.Future

object Application extends Controller with ExecutionContexts {
  def index = Action {
    NoCache(Ok("Hello, I am the Facia Press."))
  }

  def showCurrentConfig = Action {
    NoCache(Ok(ConfigAgent.contentsAsJsonString).withHeaders("Content-Type" -> "application/json"))
  }

  def generateFrontJson() = Action.async { request =>
    LiveFapiFrontPress.generateFrontJsonFromFapiClient()
      .map(Json.prettyPrint)
      .map(Ok.apply(_))
      .map(NoCache.apply)
      .fold(
        apiError => InternalServerError(apiError.message),
        successJson => successJson
      )}

  def generateLivePressedFor(path: String) = Action.async { request =>
    LiveFapiFrontPress.getPressedFrontForPath(path)
      .map(Json.toJson(_))
      .map(Json.prettyPrint)
      .map(Ok.apply(_))
      .map(NoCache.apply)
      .fold(
        apiError => InternalServerError(apiError.message),
        successJson => successJson.withHeaders("Content-Type" -> "application/json")
      )}

  private def handlePressRequest(path: String, liveOrDraft: String)(f: (String) => Future[_]): Future[Result] =
    if (FaciaPressOnDemand.isSwitchedOn) {
      val stage = Configuration.facia.stage.toUpperCase
      f(path)
        .map(_ => NoCache(Ok(s"Successfully pressed $path on $liveOrDraft for $stage")))
        .recover { case t => NoCache(InternalServerError(t.getMessage))}}
    else {
      Future.successful(NoCache(ServiceUnavailable))}

  def pressLiveForPath(path: String) = Action.async {
    handlePressRequest(path, "live")(FrontPress.pressLiveByPathId)
  }

  def pressDraftForPath(path: String) = Action.async {
    handlePressRequest(path, "draft")(FrontPress.pressDraftByPathId)
  }
}
