package controllers

import common._
import play.api.mvc.{ Action, Controller }
import model._
import conf._

import concurrent.Future

case class StoriesPage(stories: Seq[Story]) extends Page(
  canonicalUrl = None,
  "stories",
  "news", "stories",
  "GFE:story:stories") {
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "story")
}

case class StoryPage(story: Story) extends Page(
  canonicalUrl = None,
  s"stories/${story.id}",
  "news", story.title,
  s"GFE:story:${story.title}") {
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "story")
}

object StoryController extends Controller with Logging with ExecutionContexts {

  def latest() = Action { implicit request =>
    val promiseOfStories = Future(Story.mongo.latest())

    Async {
      promiseOfStories.map { stories =>
        if (stories.nonEmpty) {
          val storyId = request.getQueryString("storyId").getOrElse("0")
          val filteredStories = stories.filterNot(_.id.equals(storyId))
          
          val htmlResponse = () => views.html.latest(StoriesPage(filteredStories))
          val jsonResponse = () => views.html.fragments.latestBody(StoriesPage(filteredStories))
          renderFormat(htmlResponse, jsonResponse, StoriesPage(filteredStories), Switches.all)
        } else {
          JsonNotFound()
        }
      }
    }
  }

  def latestWithContent() = Action { implicit request =>
    val promiseOfStories = Future(Story.mongo.latestWithContent(request.getQueryString("storyId"), limit = 2))

    Async {
      promiseOfStories.map { stories =>
        if (stories.nonEmpty) {
          Cached(300) {
            val html = views.html.fragments.latestWithContent(stories)
            JsonComponent(html)
          }
        } else {
          JsonNotFound()
        }
      }
    }
  }

  def byId(id: String) = Action {
    implicit request =>
      val edition = Edition(request)
      val promiseOfStory = Future(Story.mongo.byId(id))

      Async {
        promiseOfStory.map { storyOption =>
          storyOption.map { story =>
            val htmlResponse = () => views.html.story(StoryPage(story))
            val jsonResponse = () => views.html.fragments.storyBody(StoryPage(story))
            renderFormat(htmlResponse, jsonResponse, StoryPage(story), Switches.all)
          }.getOrElse(JsonNotFound())
        }
      }
  }

  def headerAndBlock(id: String) = Action {
    implicit request =>
      val promiseOfStory = Future(Story.mongo.withContent(id))

      Async {
        promiseOfStory.map { storyOption =>

          storyOption.map { story =>

            Cached(60) {
              JsonComponent(
                "title" -> views.html.fragments.storyArticleHeader(story),
                "block" -> views.html.fragments.storyArticleBlock(story)
              )
            }

          }.getOrElse(JsonNotFound())
        }
      }
  }
}
