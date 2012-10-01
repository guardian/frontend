package controllers

import common._
import play.api.mvc.{ Action, Controller }
import feed.Competitions

object FixturesController extends Controller with Logging {

  def render() = Action { implicit request =>

    val compeititons = Competitions.all

    Ok(views.html.fixtures(compeititons))
  }
}
