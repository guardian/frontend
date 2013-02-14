package controllers

import common._
import play.api.mvc.{ Result, RequestHeader, Action, Controller }
import model._
import play.api.templates.Html
import play.api.libs.concurrent.Akka
import play.api.Play.current

case class GroupedByContent(event: Event, content: Map[String, Seq[Content]])

object StoryPackageController extends Controller with Logging {

  def dateGroupList(contentId: String) = Action { implicit request =>

    val promiseOfEvents = Akka.future(Event.mongo.withContent(contentId).filter(_.hasContent).map { event =>
      val groupedContent = event.contentByDate
      GroupedByContent(event, groupedContent)
    })

    Async {
      promiseOfEvents.map(e => renderGroup(e, views.html.fragments.timelineGroupPackage.apply))
    }
  }

  def toneGroupList(contentId: String) = Action { implicit request =>

    val promiseOfEvents = Akka.future(Event.mongo.withContent(contentId).map { event =>
      val groupedContent = event.contentByTone
      GroupedByContent(event, groupedContent)
    })

    Async {
      promiseOfEvents.map(e => renderGroup(e, views.html.fragments.toneGroupPackage.apply))
    }
  }

  def simpleList(contentId: String) = Action { implicit request =>
    val promiseOfEvents = Akka.future(Event.mongo.withContent(contentId).sortBy(_.startDate.getMillis))
    Async {
      promiseOfEvents.map(e => renderGroup(e, views.html.fragments.storyPackage.apply))
    }
  }

  def version1List(contentId: String) = Action { implicit request =>
    val promiseOfEvents = Akka.future(Event.mongo.withContent(contentId).sortBy(_.startDate.getMillis).reverse)
    Async {
      promiseOfEvents.map(e => renderGroup(e, views.html.fragments.storyPackageV1.apply))
    }
  }

  def version2List(contentId: String) = Action { implicit request =>
    val promiseOfEvents = Akka.future(Event.mongo.withContent(contentId).sortBy(_.startDate.getMillis).reverse)
    Async {
      promiseOfEvents.map(e => renderGroup(e, views.html.fragments.storyPackageV2.apply))
    }
  }

  private def renderGroup[T](events: Seq[T], block: Function1[Seq[T], Html])(implicit request: RequestHeader): Result = {
    events match {
      case Nil => NoContent
      case e => Cached(60) {
        request.getQueryString("callback").map(callback => JsonComponent(block(e))).getOrElse(Ok(Compressed(block(e))))
      }
    }
  }
}
