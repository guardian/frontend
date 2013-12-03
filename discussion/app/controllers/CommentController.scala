package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.Action
import play.api.libs.json.Json
import discussion.model.Comment;

trait CommentController extends DiscussionController {

  def commentJson(id: String) = comment(id)

  def comment(id: String) = Action.async {
    implicit request =>
      // val page = request.getQueryString("page").getOrElse("1")
      // val pageSize = request.getQueryString("pageSize").getOrElse("")
      // val maxResponses = request.getQueryString("maxResponses").getOrElse("999")
      val comment = discussionApi.commentFor(id)
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

}
