package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import feed.MostPopularAgent
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.mvc.Result
import akka.dispatch.OnFailure

object MoreStoriesController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val edition = Site(request).edition
    val section = path.split("/").headOption.getOrElse("")
    val promiseOfMoreStories = mostViewed(edition, section)
    Async {
      promiseOfMoreStories.map { moreStories =>
        moreStories match {
          case Left(moreStories) => {
            renderJson(path, section, moreStories)
          }
          // get network front's more stories
          case Right(notFound) => {
            val promiseOfNetworkFrontMoreStories = mostViewed(edition, "")
            Async {
              promiseOfNetworkFrontMoreStories.map { networkFrontMoreStories =>
                networkFrontMoreStories match {
                  case Left(networkFrontMoreStories) => {
                    renderJson(path, networkFrontMoreStories)
                  }
                  case Right(notFound) => JsonNotFound()
                }
              }
            }
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
      .response.map{ response =>
        val items = SupportedContentFilter(response.mostViewed map { new Content(_) })
        if (!items.isEmpty) {
          Left(items)
        } else {
          Right(NotFound)
        }
      }
      .recover{ suppressApiNotFound }
  }
  
  private def moreStoriesToJson(path: String, moreStories: Seq[Content]): Seq[JsValue] = {
    moreStories.filter { _.url != s"/$path" }.map { story => toJson(Map("url" -> story.url)) }
  }

  private def renderJson(path: String, moreStories: Seq[Content])(implicit request: RequestHeader): Result = {
    var stories = moreStoriesToJson(path, moreStories);
    Cached(900){ JsonComponent(("stories" -> toJson(stories))) }
  }

  private def renderJson(path: String, section: String, moreStories: Seq[Content])(implicit request: RequestHeader): Result = {
    val currentPage = toJson(Map("url" -> s"/$path"))
    var stories = currentPage +: moreStoriesToJson(path, moreStories)
    // append section front at the end, if we're not currently on it
    if (!path.equals(section)) {
      stories = stories ++ Seq(toJson(Map("url" -> s"/$section")))
    }
    Cached(900){ JsonComponent(("stories" -> toJson(stories))) }
  }

}