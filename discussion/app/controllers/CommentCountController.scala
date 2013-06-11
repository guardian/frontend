package controllers

import common._
import play.api.mvc.{ Controller, Action }
import discussion.DiscussionApi
import model.Cached
import play.libs.Json._

object CommentCountController extends Controller with Logging with ExecutionContexts {

  def render(shortUrls: String) = Action { implicit request =>
    val promiseOfComments = DiscussionApi.commentCounts(shortUrls)

    Async {
      promiseOfComments.map{ counts =>
        Cached(60){
          JsonComponent(
            "counts" -> stringify(counts.toSeq.map( c => toJson(c.id -> c.count)).toMap)
          )
        }
      }
    }
  }

}
