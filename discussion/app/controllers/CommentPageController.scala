package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.Action
import play.api.libs.json.Json
import discussion.model.{DiscussionKey, Comment}
import scala.concurrent.Future
import play.api.mvc.Results.Redirect

trait CommentPageController extends DiscussionController {  

  def commentRedirectJson(id: Int) = commentRedirect(id)
  def commentRedirect(id: Int) = Action.async {
    implicit request =>
      discussionApi.commentContext(id) map {
        page =>
          Redirect("/discussion"+ page._1 + (if (request.isJson) ".json" else "") +"?page="+ page._2 + "#comment-"+ id).withHeaders("Access-Control-Allow-Origin" -> "*")
      }
  }

  def commentPageJson(key: DiscussionKey) = commentPage(key)
  def commentPage(key: DiscussionKey) = Action.async {
    implicit request =>
      val page = request.getQueryString("page").getOrElse("1")
      val commentPage = discussionApi.commentsFor(key, page)
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
