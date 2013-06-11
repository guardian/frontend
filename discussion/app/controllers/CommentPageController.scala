package controllers

import common._
import play.api.mvc.{ Controller, Action }
import discussion.DiscussionApi
import model.Cached

object CommentPageController extends Controller with Logging with ExecutionContexts {

  def render(shortUrl: String, format: String = "html") = Action { implicit request =>
    val page = request.getQueryString("page").getOrElse("1")
    val promiseOfComments = DiscussionApi.commentsFor(shortUrl, page)

    Async {
      promiseOfComments.map{ commentPage =>
        Cached(60){
          if (request.isJson)
            JsonComponent(
              "html" -> views.html.fragments.commentsBody(commentPage).toString,
              "hasMore" ->  commentPage.hasMore,
              "currentPage" -> commentPage.currentPage
            )
          else
            Ok(views.html.comments(commentPage))
        }
      }
    }
  }
}
