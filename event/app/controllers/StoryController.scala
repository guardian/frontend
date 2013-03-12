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
  s"stories/${story.id}",
  "news", story.title,
  s"GFE:story:${story.title}") {
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

  def latestWithContent() = Action { implicit request =>
    val edition = Site(request).edition
    val promiseOfStories = Future(Story.mongo.latestWithContent())

    Async {
      promiseOfStories.map { stories =>
        if (stories.nonEmpty) {
          Cached(60) {
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

  def contentType(id: String, contentType: String) = Action {
    implicit request =>

      val edition = Site(request).edition
      val promiseOfStory = Future(Story.mongo.byId(id))

      Async {
        promiseOfStory.map { storyOption =>
          storyOption.map { story =>

            Cached(60) {
              val analysis = story.contentByColour.get("Analysis").getOrElse(Nil)
                .sortBy(_.webPublicationDate.getMillis).reverse.sortBy(_.importance).filter(!_.quote.isDefined)

              val html = contentType match {
                case "analysis" => views.html.fragments.analysis(story, edition, analysis)
              }
              JsonComponent(html)
            }
          }.getOrElse(JsonNotFound())
        }
      }
  }

  def headerAndBlock(id: String) = Action {
    implicit request =>
      val edition = Site(request).edition
      val promiseOfStory = Future(Story.mongo.withContent(id))

      Async {
        promiseOfStory.map { storyOption =>

          storyOption.map { story =>

            Cached(60) {
              JsonComponent(
                "title" -> views.html.fragments.storyArticleHeader(story),
                "block" -> views.html.fragments.storyArticleBlock(story, edition)
              )
            }

          }.getOrElse(JsonNotFound())
        }
      }
  }
}
