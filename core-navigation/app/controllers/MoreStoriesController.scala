package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import feed.MostPopularAgent
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future
import play.api.libs.json.Json._
import play.api.mvc.Result

object MoreStoriesController extends Controller with Logging {

  def renderMostViewed(path: String) = Action { implicit request =>
    val promiseOfMoreStories = getMostViewed(path, Edition(request))
    Async {
      promiseOfMoreStories.map { moreStories =>  renderJson(moreStories) }
    }
  }

  def renderFrontTrails(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val promiseOfMoreStories = getFrontTrails(path, edition)
    Async {
      promiseOfMoreStories.map{
        case Nil => JsonNotFound()
        case moreStories => renderJson(moreStories)
      }
    }
  }

  private def getMostViewed(path: String, edition: Edition)(implicit request: RequestHeader) = path match {
    case "/" | "" => Future(MostPopularAgent.mostPopular(edition)) // network front
    case _ => {
      log.info(s"Fetching more stories (most viewed): $path for edition $edition")
      ContentApi.item(path, edition)
        .showMostViewed(true)
        .response.map{ response =>
          SupportedContentFilter(response.mostViewed map { new Content(_) }) match {
            case Nil => MostPopularAgent.mostPopular(edition)
            case mostViewedForSection => mostViewedForSection
          }
        }
    }
  }

  private def getFrontTrails(path: String, edition: Edition)(implicit request: RequestHeader) = {
    log.info(s"Fetching more stories (front trails): $path for edition $edition")
    ContentApi.item(path, edition)
      .showEditorsPicks(true)
      .response.map {response =>
          val editorsPicks = response.editorsPicks map { new Content(_) }
          val editorsPicksIds = editorsPicks map { _.id }
          val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }
          editorsPicks ++ latestContent
      }.recover{
        case t: Throwable =>
          log.info("Error fetching front trails", t)
          MostPopularAgent.mostPopular(edition)
      }
  }
  
  private def renderJson(moreStories: Seq[Content])(implicit request: RequestHeader): Result = {
    val stories = moreStories.map { story => toJson(Map("url" -> story.url)) }
    Cached(900){ JsonComponent(("stories" -> toJson(stories))) }
  }

}