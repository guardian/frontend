package controllers

import common._
import play.api.mvc.{ Controller, Action }
import discussion.DiscussionApi
import model.Cached
import play.libs.Json._
import play.api.libs.json.{JsString, JsArray, JsNumber, JsObject}

object CommentCountController extends Controller with Logging with ExecutionContexts with implicits.Collections {

  def render(shortUrls: String) = Action { implicit request =>
    val promiseOfComments = DiscussionApi.commentCounts(shortUrls)

    Async {
      promiseOfComments.map{ counts =>
        Cached(60){
          JsonComponent(
            JsObject(Seq("counts" -> JsArray(counts.map(_.toJson))))
          )
        }
      }
    }
  }

}
