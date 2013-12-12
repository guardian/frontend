package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader }
import play.api.libs.json.Json
import discussion.model.{ DiscussionKey, Comment }
import scala.concurrent.Future
import play.api.mvc.Results.Redirect
import play.api.mvc.SimpleResult

trait CommentPageController extends DiscussionController {  

  def commentPermalinkJson(id: Int) = commentPermalink(id)
  def commentPermalink(id: Int) = Action.async { 
    implicit request =>
      discussionApi.commentContext(id) flatMap { context => getDiscussion(context._1, context._2) } 
  }

  def commentPageJson(key: DiscussionKey) = commentPage(key)
  def commentPage(key: DiscussionKey) = Action.async { 
    implicit request =>
      getDiscussion(key, request.getQueryString("page").getOrElse("1"))
  }

  def getDiscussion(key: DiscussionKey, page: String = "1")(implicit request: RequestHeader):Future[SimpleResult] = {
    val allResponses = request.getQueryString("allResponses").exists(_ == "true")
    val commentPage = discussionApi.commentsFor(key, page, allResponses)
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
              "html" -> views.html.fragments.commentsBody(page, blankComment).toString,
              "hasMore" -> page.hasMore,
              "currentPage" -> page.currentPage
            )
          else
            Ok(views.html.comments(page))
        }
    }
  }

}
