package controllers

import common.ExecutionContexts
import frontpress.{FapiFrontPress, FrontPress}
import model.NoCache
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.ConfigAgent

object Application extends Controller with ExecutionContexts {
  def index = Action {
    NoCache(Ok("Hello, I am the Facia Press."))
  }

  def showCurrentConfig = Action {
    NoCache(Ok(ConfigAgent.contentsAsJsonString).withHeaders("Content-Type" -> "application/json"))
  }

  def generateFrontJson() = Action.async { request =>
    FapiFrontPress.generateFrontJsonFromFapiClient()
      .map(Json.prettyPrint)
      .map(Ok.apply(_))
      .map(NoCache.apply)
      .fold(
        apiError => InternalServerError(apiError.message),
        successJson => successJson
      )}

  def generateLivePressedFor(path: String) = Action.async { request =>
    FapiFrontPress.getPressedFrontForPath(path)
      .map(Json.toJson(_))
      .map(Json.prettyPrint)
      .map(Ok.apply(_))
      .map(NoCache.apply)
      .fold(
        apiError => InternalServerError(apiError.message),
        successJson => successJson.withHeaders("Content-Type" -> "application/json")
      )}
}
