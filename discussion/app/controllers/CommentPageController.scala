package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.Action
import play.api.libs.json.Json
import discussion.model.{DiscussionKey, Comment}

trait CommentPageController extends DiscussionController {

  def commentPageJson(key: DiscussionKey) = commentPage(key)

  def commentPage(key: DiscussionKey) = Action.async {
    implicit request =>
      val page = request.getQueryString("page").getOrElse("1")
      val pageSize = request.getQueryString("pageSize").getOrElse("")
      val maxResponses = request.getQueryString("maxResponses").getOrElse("999")
      val commentPage = discussionApi.commentsFor(key, page, pageSize, maxResponses)
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
        commentPage =>
          Cached(60) {
            if (request.isJson)
              JsonComponent(
                "html" -> views.html.fragments.commentsBody(commentPage, blankComment).toString,
                "hasMore" -> commentPage.hasMore,
                "currentPage" -> commentPage.currentPage
              )
            else
              Ok(views.html.comments(commentPage))
          }
      }
  }

}
