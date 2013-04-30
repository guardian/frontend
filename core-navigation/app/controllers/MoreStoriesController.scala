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
    val section = path.split("/").headOption.getOrElse("")
    val promiseOfMoreStories = mostViewed(edition, section).map(_.toList)
    Async {
      promiseOfMoreStories.map {
        sectionPopular =>
          sectionPopular match {
            case Nil => JsonNotFound()
            case moreStories => {
              val currentPage = toJson(Map("url" -> s"/$path"))
              var stories = currentPage +: moreStories.filter { _.url != s"/$path" }.map { story => toJson(Map("url" -> story.url)) } 
              // append section front at the end, if we're not currently on it
              if (!path.equals(section)) {
                stories = stories ++ Seq(toJson(Map("url" -> s"/$section")))
              }
              Cached(900){ JsonComponent(("stories" -> toJson(stories))) }
            }
          }
      }
    }
  }

  private def mostViewed(edition: String, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching more stories: $path for edition $edition")
    ContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .response.map{response =>
          SupportedContentFilter(response.mostViewed map { new Content(_) })
    }
  }
}