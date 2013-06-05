package controllers

import common._
import play.api.mvc.{ Controller, Action }
import discussion.DiscussionApi

object CommentPageController extends Controller with Logging with ExecutionContexts with DiscussionApi {

  def render(shortUrl: String) = Action { implicit request =>

    val promiseOfComments = commentsFor(shortUrl)

    Async {
      promiseOfComments.map{ commentPage =>

        renderFormat(
          htmlResponse = () => views.html.comments(commentPage),
          jsonResponse = () => views.html.fragments.commentsBody(commentPage),
          cacheTime = 60
        )
      }
    }
  }
}
