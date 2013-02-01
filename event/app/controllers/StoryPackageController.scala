package controllers

import common._
import play.api.mvc.{ Result, RequestHeader, Action, Controller }
import model._
import play.api.templates.Html

case class GroupedByContent(event: Event, content: Map[String, Seq[Content]])

object StoryPackageController extends Controller with Logging {

  def toneGroupList(contentId: String) = Action { implicit request =>

    val events = Event.mongo.withContent(contentId).map { event =>
      val groupedContent = event.content.groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News"))
      GroupedByContent(event, groupedContent)
    }
    renderGroup(views.html.fragments.toneGroupPackage(events))
  }

  def simpleList(contentId: String) = Action { implicit request =>
    val events = Event.mongo.withContent(contentId)
    events.sortBy(_.startDate.getMillis)
    renderGroup(views.html.fragments.storyPackage(events))
  }

  private def renderGroup(html: Html)(implicit request: RequestHeader): Result = {
    Cached(60) {
      request.getQueryString("callback").map {
        callback =>
          JsonComponent(html)
      } getOrElse {
        Cached(60) {
          Ok(Compressed(html))
        }
      }
    }
  }
}
