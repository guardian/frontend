package controllers

import model.Cached
import common.JsonComponent
import play.api.libs.json.{JsArray, JsObject}
import play.api.mvc.Action

trait CommentCountController extends DiscussionController {

  def commentCount(shortUrls: String) = Action { implicit request =>
    Cached.async(discussionApi.commentCounts(shortUrls)) {
      counts =>
        JsonComponent(
          JsObject(Seq("counts" -> JsArray(counts.map(_.toJson))))
        )
    }
  }

}
