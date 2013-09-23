package controllers

import play.api.mvc.{Action, Controller}
import common.{JsonComponent, ExecutionContexts, Logging}
import discussion.DiscussionApi
import model.Cached
import play.api.libs.json.{JsArray, JsObject}

trait DiscussionController
  extends Controller
  with Logging
  with ExecutionContexts
  with implicits.Requests{

  protected val discussionApi: DiscussionApi

  def commentCount(shortUrls: String) = Action { implicit request =>
    Cached.async(discussionApi.commentCounts(shortUrls)) {
      counts =>
        JsonComponent(
          JsObject(Seq("counts" -> JsArray(counts.map(_.toJson))))
        )
    }
  }

  def commentPage(shortUrl: String) = Action { implicit request =>
    val page = request.getQueryString("page").getOrElse("1")

    Cached.async(discussionApi.commentsFor(shortUrl, page)) {
      commentPage =>
        if (request.isJson)
          JsonComponent(
            "html" -> views.html.fragments.commentsBody(commentPage).toString,
            "hasMore" -> commentPage.hasMore,
            "currentPage" -> commentPage.currentPage,
            "commentBoxHtml" -> views.html.fragments.commentBox
          )
        else
          Ok(views.html.comments(commentPage))
    }
  }
}
