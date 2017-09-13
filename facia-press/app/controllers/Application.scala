package controllers

import common.ImplicitControllerExecutionContext
import conf.Configuration
import conf.switches.Switches.FaciaPressOnDemand
import frontpress.{DraftFapiFrontPress, LiveFapiFrontPress}
import model.NoCache
import play.api.libs.json.Json
import play.api.mvc._
import services.ConfigAgent

import scala.concurrent.Future

class Application(liveFapiFrontPress: LiveFapiFrontPress, draftFapiFrontPress: DraftFapiFrontPress, val controllerComponents: ControllerComponents) extends BaseController with ImplicitControllerExecutionContext {

  def index = Action {
    NoCache(Ok("Hello, I am the Facia Press."))
  }

  def showCurrentConfig = Action {
    NoCache(Ok(ConfigAgent.contentsAsJsonString).withHeaders("Content-Type" -> "application/json"))
  }

  def generateLivePressedFor(path: String) = Action.async { request =>
    liveFapiFrontPress.getPressedFrontForPath(path)
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
      Future.successful(NoCache(ServiceUnavailable(s"This service has been disabled by the switch: ${FaciaPressOnDemand.name}")))}

  def pressLiveForPath(path: String) = Action.async {
    handlePressRequest(path, "live")(liveFapiFrontPress.pressByPathId)
  }

  def pressDraftForPath(path: String) = Action.async {
    handlePressRequest(path, "draft")(draftFapiFrontPress.pressByPathId)
  }

  def pressDraftForAll() = Action.async {
    ConfigAgent.getPathIds.foldLeft(Future.successful(List[(String, Result)]())){ case (lastFuture, path) =>
      lastFuture
        .flatMap(resultList => handlePressRequest(path, "draft")(draftFapiFrontPress.pressByPathId)
          .map(path -> _)
          .map(resultList :+ _))
    }.map { pressedPaths =>
      Ok(s"Pressed ${pressedPaths.length} paths on DRAFT: ${pressedPaths.map{ case (a, b) => (a, b.header.status)}}")}
    .recover { case t: Throwable =>
        InternalServerError(s"Error pressing all paths on draft: $t")}
  }
}
