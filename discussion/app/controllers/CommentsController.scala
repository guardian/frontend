package controllers

import model.Cached
import scala.concurrent.Future
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader, SimpleResult }
import discussion.model.{BlankComment, DiscussionKey}

trait CommentsController extends DiscussionController {

  def commentPermalinkJson(id: Int, order: String) = commentPermalink(id, order)

  def commentPermalink(id: Int, order: String) = Action.async { implicit request =>
    discussionApi.commentContext(id, order) flatMap { context =>
      getComments(context._1, context._2, forceAllResponses = true, orderBy = order)
    }
  }

  def commentJson(id: Int) = comment(id)
  def comment(id: Int) = Action.async { implicit request =>
    val comment = discussionApi.commentFor(id)
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

  def topComments(key: DiscussionKey) = comments(key, orderBy = "oldest", isTopComments = true)
  def topCommentsJson(key: DiscussionKey) = comments(key, orderBy = "oldest", isTopComments = true)

  def commentsJson(key: DiscussionKey, orderBy: String = "newest") = comments(key, orderBy)
  def comments(key: DiscussionKey, orderBy: String = "newest", isTopComments: Boolean = false) = Action.async { implicit request =>
    getComments(key, request.getQueryString("page").getOrElse("1"), orderBy, isTopComments)
  }

  def getComments(key: DiscussionKey, page: String = "1", orderBy: String = "newest", isTopComments: Boolean = false, forceAllResponses: Boolean = false)
                 (implicit request: RequestHeader): Future[SimpleResult] = {
    val allResponses = forceAllResponses || (request boolParam "allResponses")
    val commentPage = if (isTopComments) discussionApi.topCommentsFor(key) else discussionApi.commentsFor(key, page, orderBy, allResponses)
    commentPage map {
      page =>
        Cached(60) {
          if (request.isJson)
            JsonComponent(
              "html" -> views.html.fragments.commentsBody(page, BlankComment(), isTopComments).toString,
              "hasMore" -> page.hasMore,
              "currentPage" -> page.currentPage,
              "currentCommentCount" -> page.comments.length
            )
          else
            Ok(views.html.comments(page))
        }
    }
  }
}
