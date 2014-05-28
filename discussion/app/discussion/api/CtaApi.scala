package discussion.api

import play.api.libs.json.JsValue
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws.Response
import discussion.model.{Discussion, Profile, DiscussionKey, Comment}
import discussion.util.Http


trait CtaApi extends Http {
  protected val ctaApiRoot: String

  def getTopComments(key: DiscussionKey): Future[List[Comment]] = {
    val ctaUrl: String = s"$ctaApiRoot/cta/article/${key.keyAsString}"
    def onError(r: Response) = s"Error loading CallToAction, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    def getComments(json: JsValue): List[Comment] = {
      for {
        component <- (json \ "components").as[List[JsValue]]
        comment <- (component \ "comments").as[List[JsValue]]
      } yield Comment(comment, None, Some(Discussion.empty))
    }

    getJsonOrError(ctaUrl, onError) map getComments
  }
}


