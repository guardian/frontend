package controllers

import common._
import play.api.libs.json.Json._
import play.api.mvc.{ Controller, Action }
import discussion.DiscussionApi

object CommentPageController extends Controller with Logging with ExecutionContexts with DiscussionApi {

  def render(shortUrl: String) = Action { implicit request =>
    val page = request.getQueryString("page").getOrElse("1")
    val promiseOfComments = commentsFor(shortUrl, page)

    Async {
      promiseOfComments.map{ commentPage =>

        renderFormat(
          htmlResponse = () => views.html.comments(commentPage),
          jsonResponse = () => JsonComponent((
            "html" -> views.html.fragments.commentsBody(commentPage).toString,
            "commentCount" -> "556"
          ).toJson),
          cacheTime = 60
        )
      }
    }
  }
}
