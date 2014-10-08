package controllers

import model.Cached
import scala.concurrent.Future
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader, Result }
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
    val commentPage = discussionApi.commentsFor(key, params)

    commentPage map {
      page =>
        Cached(60) {
          if (request.isJson)
            JsonComponent(
              "html" -> views.html.discussionComments.discussionComponent(page, BlankComment(), params.topComments).toString,
              "currentCommentCount" -> page.comments.length
            )
          else
            Ok(views.html.discussionComments.discussionPage(page))
        }
    }
  }
}

case class DiscussionParams(orderBy: String, page: String, pageSize: String, maxResponses: Option[String] = None, topComments: Boolean)
object DiscussionParams extends {
  def apply(request: RequestHeader): DiscussionParams = {
    DiscussionParams(
      orderBy = request.getQueryString("orderBy").getOrElse("newest"),
      page = request.getQueryString("page").getOrElse("1"),
      pageSize = request.getQueryString("pageSize").getOrElse("50"),
      maxResponses = request.getQueryString("maxResponses"),
      topComments = request.getQueryString("topComments").map(_ == "true").getOrElse(false)
    )
  }
}