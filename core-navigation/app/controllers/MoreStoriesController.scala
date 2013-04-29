package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import feed.MostPopularAgent
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future
import play.api.libs.json.Json._

object MoreStoriesController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val edition = Site(request).edition
    val promiseOfMoreStories = lookup(edition, path).map(_.toList)
    Async {
      promiseOfMoreStories.map {
        sectionPopular =>
          sectionPopular match {
            case Nil => JsonNotFound()
            case moreStories => Cached(900){ JsonComponent(("stories" -> toJson(moreStories.map { story => toJson(Map("url" -> story.url)) }))) }
          }
      }
    }
  }

  private def lookup(edition: String, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching more stories: $path for edition $edition")
    ContentApi.item(path, edition)
      .tag(None)
      .showRelated(true)
      .showMostViewed(true)
      .response.map{response =>
          SupportedContentFilter((response.relatedContent ++ response.mostViewed) map { new Content(_) })
    }
  }
}