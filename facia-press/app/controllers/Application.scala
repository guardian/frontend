package controllers

import play.api.mvc.{Action, Controller}

object Application extends Controller {
  def index = Action {
    Ok("Hello, I am the Facia Press.")
  }
}
