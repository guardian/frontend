package controllers

import model.Cached
import scala.concurrent.Future
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader, SimpleResult }
import play.api.libs.json.Json
import discussion.model.{ DiscussionKey, Comment }
import play.api.data._
import play.api.data.Forms._

trait CommentsController extends DiscussionController {

  def commentPermalinkJson(id: Int) = commentPermalink(id)
  def commentPermalink(id: Int) = Action.async { implicit request =>
    discussionApi.commentContext(id) flatMap { context => getComments(context._1, context._2) }
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

  def topComments(key: DiscussionKey) = comments(key, isTopComments = true)
  def topCommentsJson(key: DiscussionKey) = comments(key, isTopComments = true)
  def oldestComments(key: DiscussionKey) = comments(key, orderBy = "oldest")
  def oldestCommentsJson(key: DiscussionKey) = comments(key, orderBy = "oldest")
  def commentsJson(key: DiscussionKey) = comments(key)
  def comments(key: DiscussionKey, orderBy: String = "newest", isTopComments: Boolean = false) = Action.async { implicit request =>
    getComments(key, request.getQueryString("page").getOrElse("1"), orderBy, isTopComments)
  }

  def getComments(key: DiscussionKey, page: String = "1", orderBy: String = "newest", isTopComments: Boolean = false)(implicit request: RequestHeader):Future[SimpleResult] = {
    val allResponses = request.getQueryString("allResponses").exists(_ == "true")
    val commentPage = if (isTopComments) discussionApi.topCommentsFor(key) else discussionApi.commentsFor(key, page, orderBy, allResponses)
    val blankComment = Comment(Json.parse("""{
      "id": 5,
      "body": "",
      "responses": [],
      "userProfile": {
        "userId": "",
        "displayName": "",
        "webUrl": "",
        "apiUrl": "",
        "avatar": "",
        "secureAvatarUrl": "",
        "badge": []
      },
      "isoDateTime": "2011-10-10T09:25:49Z",
      "status": "visible",
      "numRecommends": 0,
      "isHighlighted": false
    }"""))

    commentPage map {
      page =>
        Cached(60) {
          if (request.isJson)
            JsonComponent(
              "html" -> views.html.fragments.commentsBody(page, blankComment, isTopComments).toString,
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
