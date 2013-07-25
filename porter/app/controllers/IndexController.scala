package controllers

import play.api.mvc.{ Action, Controller }

object IndexController extends Controller {
  def index() = Action { Ok("Ok") }
}
