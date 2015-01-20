package controllers

import common.ExecutionContexts
import frontpress.FrontPress
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

  def generateLivePressedFor(path: String) = Action.async { request =>
    FrontPress.pressLiveByPathId(path).map(Json.stringify(_))
      .map(Ok.apply(_))
      .map(NoCache.apply)}
}
