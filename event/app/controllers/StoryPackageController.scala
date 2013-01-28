package controllers

import common._
import play.api.mvc.{ Action, Controller }
import model._

object StoryPackageController extends Controller with Logging {

  def forContent(contentId: String) = Action { implicit request =>

    val events = Event.mongo.withContent(contentId)

    Ok("foooooo")

  }
}
