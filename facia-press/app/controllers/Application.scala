package controllers

import common.ExecutionContexts
import frontpress.FrontPress
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.ConfigAgent

object Application extends Controller with ExecutionContexts {
  def index = Action {
    Ok("Hello, I am the Facia Press.")
  }

  def showCurrentConfig = Action {
    Ok(ConfigAgent.contentsAsJsonString).withHeaders("Content-Type" -> "application/json")
  }

  def generateDraftPressedFor(path: String) = Action.async { request =>
    FrontPress.pressDraftByPathId(path).map(Json.stringify(_)).map(Ok.apply(_))
  }

  def generateLivePressedFor(path: String) = Action.async { request =>
    FrontPress.pressLiveByPathId(path).map(Json.stringify(_)).map(Ok.apply(_))
  }
}
