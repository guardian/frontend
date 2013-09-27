package controllers

import common.{ JsonComponent, ExecutionContexts, Logging }
import discussion.DiscussionApi
import model.Cached
import play.api.mvc.{ Action, Controller }
import play.api.libs.json.{JsArray, JsObject}

trait DiscussionController
  extends Controller
  with Logging
  with ExecutionContexts
  with implicits.Requests{

  protected val discussionApi: DiscussionApi

  def commentCountJson(shortUrls: String) = commentCount(shortUrls)
  def commentCount(shortUrls: String) = Action.async { implicit request =>
    val counts = discussionApi.commentCounts(shortUrls)
    counts map { counts =>
      Cached(60) {
        JsonComponent(
          JsObject(Seq("counts" -> JsArray(counts.map(_.toJson))))
        )
      }
    }
  }

  def commentPageJson(shortUrl: String) = commentPage(shortUrl)
  def commentPage(shortUrl: String) = Action.async { implicit request =>
    val page = request.getQueryString("page").getOrElse("1")
    val commentPage = discussionApi.commentsFor(shortUrl, page)

    commentPage map { commentPage =>
      Cached(60) {
        if (request.isJson)
          JsonComponent(
            "html" -> views.html.fragments.commentsBody(commentPage).toString,
            "hasMore" -> commentPage.hasMore,
            "currentPage" -> commentPage.currentPage
          )
        else
          Ok(views.html.comments(commentPage))
      }
    }
  }
}
