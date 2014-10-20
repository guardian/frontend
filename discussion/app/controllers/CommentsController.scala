package controllers

import model.Cached
import scala.concurrent.Future
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader, Result }
import discussion.{UnthreadedCommentPage, ThreadedCommentPage, DiscussionParams}
import discussion.model.{BlankComment, DiscussionKey}

object CommentsController extends DiscussionController {

  def commentContextJson(id: Int) = Action.async { implicit request =>
    val params = DiscussionParams(request)
    discussionApi.commentContext(id, params) flatMap { context =>
      getComments(context._1, Some(params.copy(page = context._2)))
    }
  }

  def commentJson(id: Int) = comment(id)
  def comment(id: Int) = Action.async { implicit request =>
    val comment = discussionApi.commentFor(id, request.getQueryString("displayThreaded"))

    comment map {
      comment =>
        Cached(60) {
          if (request.isJson)
            JsonComponent(
              "html" -> views.html.fragments.comment(comment).toString
            )
          else
            Ok(views.html.fragments.comment(comment))
        }
    }
  }

  def commentsJson(key: DiscussionKey) = comments(key)
  def comments(key: DiscussionKey) = Action.async { implicit request =>
    getComments(key)
  }

  def getComments(key: DiscussionKey, optParams: Option[DiscussionParams] = None)(implicit request: RequestHeader): Future[Result] = {
    val params = optParams.getOrElse(DiscussionParams(request))
    discussionApi.commentsFor(key, params).map { comments =>
      val page = if (params.displayThreaded) {
        ThreadedCommentPage(comments)
      } else {
        UnthreadedCommentPage(comments)
      }
      Cached(60) {
        if (request.isJson)
          JsonComponent(
            "html" -> views.html.discussionComments.commentsList(page, BlankComment(), params.topComments, params.displayThreaded).toString,
            "currentCommentCount" -> page.comments.length
          )
        else
          Ok(views.html.discussionComments.discussionPage(page))
      }
    }
  }
}