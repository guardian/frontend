package controllers

import common._
import play.api.mvc.{ Result, RequestHeader, Action, Controller }
import model._
import play.api.templates.Html
import play.api.libs.concurrent.Akka
import play.api.Play.current

object StoryController extends Controller with Logging {

  def byId(id: String) = Action {
    implicit request =>

      val promiseOfStory = Akka.future(Story.mongo.byId(id))

      Async {
        promiseOfStory.map { storyOption =>
          storyOption.map { story =>
            val page = Page(canonicalUrl = None, "story", "news", story.title, "GFE:story:" + story.title)
            val groupedContent = story.contentByTone
            Ok(Compressed(views.html.story(page, story, groupedContent)))
          }.getOrElse(NotFound)
        }
      }
  }
}
