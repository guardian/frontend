package controllers

import model.Cached
import common.JsonComponent
import discussion.api.DiscussionApiLike
import discussion.api.DiscussionApiException._
import play.api.libs.json.{JsArray, JsObject}
import play.api.mvc.{Action, ControllerComponents}

class CommentCountController(val discussionApi: DiscussionApiLike, val controllerComponents: ControllerComponents) extends DiscussionController {

  def commentCountJson(shortUrls: String) = commentCount(shortUrls)

  def commentCount(shortUrls: String) = Action.async {
    implicit request =>
      val counts = discussionApi.commentCounts(shortUrls)
      counts map {
        counts =>
          Cached(300) {
            JsonComponent(
              JsObject(Seq("counts" -> JsArray(counts.map(_.toJson))))
            )
          }
      } recover toResult
  }

}
