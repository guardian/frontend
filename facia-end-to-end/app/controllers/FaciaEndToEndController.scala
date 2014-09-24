package controllers

import common.{ExecutionContexts, Logging}
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import services.ConfigAgent


object FaciaEndToEndController extends Controller with Logging with ExecutionContexts {

  def configAgentContents = Action {
    Ok(Json.prettyPrint(Json.parse(ConfigAgent.contentsAsJsonString)))
  }
}
