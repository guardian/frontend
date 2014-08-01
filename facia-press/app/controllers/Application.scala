package controllers

import play.api.mvc.{Action, Controller}
import services.ConfigAgent

object Application extends Controller {
  def index = Action {
    Ok("Hello, I am the Facia Press.")
  }
  
  def showCurrentConfig = Action {
    Ok(ConfigAgent.contentsAsJsonString).withHeaders("Content-Type" -> "application/json")
  }
}
