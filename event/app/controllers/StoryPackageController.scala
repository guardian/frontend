package controllers

import common._
import play.api.mvc.{ Result, RequestHeader, Action, Controller }
import model._
import play.api.templates.Html

case class GroupedByContent(event: Event, content: Map[String, Seq[Content]])

case class Event(event) {
  lazy val contentByDate: Map[String, Seq[Content]] = event.content.groupBy(_.webPublicationDate.toDateMidnight.toString())
  lazy val contentByTone: Map[String, Seq[Content]] = event.content.groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News"))
}

object StoryPackageController extends Controller with Logging {

  def dateGroupList(contentId: String) = Action { implicit request =>

    val events = Event.mongo.withContent(contentId).map { event =>
      val groupedContent = event.content.groupBy(_.webPublicationDate.toDateMidnight.toString())
      GroupedByContent(event, groupedContent)
    }
    renderGroup(views.html.fragments.toneGroupPackage(events))
  }

  def toneGroupList(contentId: String) = Action { implicit request =>

    val events = Event.mongo.withContent(contentId).map { event =>
      val groupedContent = event.content.groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News"))
      GroupedByContent(event, groupedContent)
    }
    renderGroup(views.html.fragments.toneGroupPackage(events))
  }

  def simpleList(contentId: String) = Action { implicit request =>
    val events = Event.mongo.withContent(contentId).sortBy(_.startDate.getMillis)
    renderGroup(views.html.fragments.storyPackage(events))
  }

  def version1List(contentId: String) = Action { implicit request =>
    val events = Event.mongo.withContent(contentId).sortBy(_.startDate.getMillis).reverse
    renderGroup(views.html.fragments.storyPackageV1(events))
  }

  def version2List(contentId: String) = Action { implicit request =>
    val events = Event.mongo.withContent(contentId).sortBy(_.startDate.getMillis).reverse
    renderGroup(views.html.fragments.storyPackageV2(events))
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
