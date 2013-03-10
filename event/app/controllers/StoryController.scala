package controllers

import common._
import play.api.mvc.{ Action, Controller }
import model._
import play.api.libs.concurrent.Execution.Implicits._
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
  "stories/" + story.id,
  "news", story.title,
  "GFE:story:" + story.title) {
  override lazy val metaData: Map[String, Any] = super.metaData + ("content-type" -> "story")
}

object StoryController extends Controller with Logging {

  def latest() = Action { implicit request =>
    val promiseOfStories = Future(Story.mongo.latest())

    Async {
      promiseOfStories.map { stories =>
        if (stories.nonEmpty) {
          Cached(60) {
            request.getQueryString("callback").map { callback =>
              val storyId = request.getQueryString("storyId").getOrElse("0")
              val html = views.html.fragments.latestStories(stories.filterNot(_.id.equals(storyId)))
              JsonComponent(html)
            } getOrElse {
              Cached(60) {
                val html = views.html.latest(StoriesPage(stories))
                Ok(Compressed(html))
              }
            }
          }
        } else {
          JsonNotFound()
        }
      }
    }
  }

  def byId(id: String) = Action {
    implicit request =>
      val edition = Site(request).edition
      val promiseOfStory = Future(Story.mongo.byId(id))

      Async {
        promiseOfStory.map { storyOption =>
          storyOption.map { story =>
            Cached(60) {
              Ok(Compressed(views.html.story(StoryPage(story), edition)))
            }
          }.getOrElse(NotFound)
        }
      }
  }

  def withContent1(id: String) = withContent(id, 1)
  def withContent2(id: String) = withContent(id, 2)

  def withContent(id: String, version: Int) = Action {
    implicit request =>

      val promiseOfStory = Future(Story.mongo.withContent(id))

      Async {
        promiseOfStory.map { storyOption =>

          storyOption.map { story =>

            Cached(60) {
              val html = version match {
                case 1 => views.html.fragments.story1(story)
                case 2 => views.html.fragments.story2(story)
              }

              JsonComponent(html)
            }

          }.getOrElse(JsonNotFound())
        }
      }
  }
}
