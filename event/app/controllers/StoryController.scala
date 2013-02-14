package controllers

import common._
import play.api.mvc.{ Result, RequestHeader, Action, Controller }
import model._
import play.api.templates.Html
import play.api.libs.concurrent.Akka
import play.api.Play.current

object StoryController extends Controller with Logging {

  //  def withContent(contentId: String) = Action { implicit request =>
  //    val story = Story.mongo.withContent(contentId)
  //    Ok(Compressed(views.html.story(story)))
  //    // val promiseOfEvents = Akka.future(Story.mongo.withContent(contentId))
  //
  //    // Async {
  //    //   promiseOfEvents.map(e => views.html.story(e))
  //    // }
  //  }

  def byId(id: String) = Action { implicit request =>
    Story.mongo.byId(id).map { story => Ok(Compressed(views.html.story(story))) }.getOrElse(NotFound)

    // val promiseOfEvents = Akka.future(Story.mongo.byId(id))

    // Async {
    //   promiseOfEvents.map(e => views.html.story(e))
    // }
  }
}