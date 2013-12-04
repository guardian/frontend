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

}
