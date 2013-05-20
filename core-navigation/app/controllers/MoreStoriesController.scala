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
    val moreStories = moreStoriesType match {
      case "mostViewed" => getMostViewed(path, edition)
      case "frontTrails" => getFrontTrails(path, edition)
    }
    Async {
      moreStories.map { moreStories =>
        moreStories match {
          case Left(moreStories) => {
            renderJson(moreStories)
          }
          // get network front's more stories
          case Right(notFound) => {
            val frontMoreStories = moreStoriesType match {
              case "mostViewed" => getMostViewed("", edition)
              case "frontTrails" => getFrontTrails("", edition)
            }
            Async {
              frontMoreStories.map { frontMoreStories =>
                frontMoreStories match {
                  case Left(frontMoreStories) => {
                    renderJson(frontMoreStories)
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

  private def getMostViewed(path: String, edition: Edition)(implicit request: RequestHeader) = {
    log.info(s"Fetching more stories (most viewed): $path for edition $edition")
    ContentApi.item(path, edition)
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
  
  private def getFrontTrails(path: String, edition: Edition)(implicit request: RequestHeader) = {
    log.info(s"Fetching more stories (front trails): $path for edition $edition")
    ContentApi.item(path, edition)
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
  
  private def renderJson(moreStories: Seq[Content])(implicit request: RequestHeader): Result = {
    val stories = moreStories.map { story => toJson(Map("url" -> story.url)) }
    Cached(900){ JsonComponent(("stories" -> toJson(stories))) }
  }

}