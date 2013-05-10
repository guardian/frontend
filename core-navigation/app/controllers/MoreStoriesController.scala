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

  def render(path: String, moreStoriesType: String) = Action { implicit request =>
    val edition = Edition(request)
    val section = path.split("/").headOption.getOrElse("")
    val moreStories = moreStoriesType match {
      case "mostViewed" => getMostViewed(path, section, edition)
      case "frontTrails" => getFrontTrails(path, section, edition)
    }
    Async {
      moreStories.map { moreStories =>
        moreStories match {
          case Left(moreStories) => {
            renderJson(path, section, moreStories)
          }
          // get network front's more stories
          case Right(notFound) => {
            val frontMoreStories = moreStoriesType match {
              case "mostViewed" => getMostViewed("", "", edition)
              case "frontTrails" => getFrontTrails("", "", edition)
            }
            Async {
              frontMoreStories.map { frontMoreStories =>
                frontMoreStories match {
                  case Left(frontMoreStories) => {
                    renderJson(path, frontMoreStories)
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

  private def getMostViewed(path: String, section: String, edition: Edition)(implicit request: RequestHeader) = {
    log.info(s"Fetching more stories (most viewed): $section for edition $edition")
    ContentApi.item(section, edition)
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
  
  private def getFrontTrails(path: String, section: String, edition: Edition)(implicit request: RequestHeader) = {
    log.info(s"Fetching more stories (front trails): $section for edition $edition")
    ContentApi.item(section, edition)
      .showEditorsPicks(true)
      .response.map {response =>
          val editorsPicks = response.editorsPicks map { new Content(_) }
          val editorsPicksIds = editorsPicks map { _.id }
          val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }
          val items = editorsPicks ++ latestContent 
          if (!items.isEmpty) {
            Left(items)
          } else {
            Right(NotFound)
          }
      }.recover{ suppressApiNotFound }
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