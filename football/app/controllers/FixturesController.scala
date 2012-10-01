package controllers

import common._
import play.api.mvc.{ Action, Controller }

object FixturesController extends Controller with Logging {

  def render() = Action { implicit request =>
    Ok(views.html.fixtures())
  }
}
