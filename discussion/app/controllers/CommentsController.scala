package controllers

import model.{Cached, TinyResponse}
import scala.concurrent.Future
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader, Result }
import discussion.{UnthreadedCommentPage, ThreadedCommentPage, DiscussionParams}
import discussion.model.{BlankComment, DiscussionKey}

object CommentsController extends DiscussionController {

  // Used for jump to comment, comment hash location.
  def commentContextJson(id: Int) = Action.async { implicit request =>
    val params = DiscussionParams(request)
    discussionApi.commentContext(id, params) flatMap { context =>
      getComments(context._1, Some(params.copy(page = context._2)))
    }
  }
  def commentContextJsonOptions(id: Int) = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }

  // Used for getting more replies for a specific comment.
  def commentJson(id: Int) = comment(id)
  def comment(id: Int) = Action.async { implicit request =>
    discussionApi.commentFor(id, request.getQueryString("displayThreaded")) map {
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

  // Get a list of comments for a discussion.
  def comments(key: DiscussionKey) = Action.async { implicit request => getComments(key) }
  def commentsJson(key: DiscussionKey) = Action.async { implicit request => getComments(key) }
  def commentsJsonOptions(key: DiscussionKey) = Action { implicit request => TinyResponse.noContent(Some("GET, OPTIONS")) }

  // Get the top comments for a discussion.
  def topCommentsJson(key: DiscussionKey) = Action.async { implicit request => getTopComments(key) }
  def topCommentsJsonOptions(key: DiscussionKey) = Action { implicit request => TinyResponse.noContent(Some("GET, OPTIONS")) }

  private def getComments(key: DiscussionKey, optParams: Option[DiscussionParams] = None)(implicit request: RequestHeader): Future[Result] = {
    val params = optParams.getOrElse(DiscussionParams(request))
    discussionApi.commentsFor(key, params).map { comments =>
      val page = if (params.displayThreaded) {
        ThreadedCommentPage(comments)
      } else {
        UnthreadedCommentPage(comments)
      }
      Cached(60) {
        if (request.isJson) {
          JsonComponent(
            "commentsHtml" -> views.html.discussionComments.commentsList(page, false).toString,
            "paginationHtml" -> views.html.fragments.commentPagination(page).toString,
            "postedCommentHtml" -> views.html.fragments.comment(BlankComment()).toString,
            "currentCommentCount" -> page.comments.length
          )
        } else {
          Ok(views.html.discussionComments.discussionPage(page))
        }
      }
    }
  }

  private def getTopComments(key: DiscussionKey)(implicit request: RequestHeader): Future[Result] = {

    discussionApi.commentsFor(key, DiscussionParams(topComments = true)).map { comments =>
      val page = UnthreadedCommentPage(comments)

      Cached(60) {
        if (request.isJson) {
          JsonComponent(
            "html" -> views.html.discussionComments.topCommentsList(page).toString
          )
        } else {
          Ok(views.html.discussionComments.topCommentsList(page))
        }
      }
    }
  }
}
