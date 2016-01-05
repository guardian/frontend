package controllers

import common.ExecutionContexts
import conf.Configuration
import conf.switches.Switches.FaciaPressOnDemand
import frontpress.{DraftFapiFrontPress, LiveFapiFrontPress}
import model.NoCache
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller, Result}
import services.ConfigAgent

import scala.concurrent.Future

object Application extends Controller with ExecutionContexts {
  def index = Action {
    NoCache(Ok("Hello, I am the Facia Press."))
  }

  def showCurrentConfig = Action {
    NoCache(Ok(ConfigAgent.contentsAsJsonString).withHeaders("Content-Type" -> "application/json"))
  }

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
    handlePressRequest(path, "live")(LiveFapiFrontPress.pressByPathId)
  }

  def pressDraftForPath(path: String) = Action.async {
    handlePressRequest(path, "draft")(DraftFapiFrontPress.pressByPathId)
  }

  def pressDraftForAll() = Action.async {
    ConfigAgent.getPathIds.foldLeft(Future.successful(List[(String, Result)]())){ case (lastFuture, path) =>
      lastFuture
        .flatMap(resultList => handlePressRequest(path, "draft")(DraftFapiFrontPress.pressByPathId)
          .map(path -> _)
          .map(resultList :+ _))
    }.map { pressedPaths =>
      Ok(s"Pressed ${pressedPaths.length} paths on DRAFT: ${pressedPaths.map{ case (a, b) => (a, b.header.status)}}")}
    .recover { case t: Throwable =>
        InternalServerError(s"Error pressing all paths on draft: $t")}
  }
}
