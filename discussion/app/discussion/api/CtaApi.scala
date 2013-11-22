package discussion.api

import play.api.libs.json.JsValue
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws.Response
import discussion.model.{DiscussionKey, Comment}
import discussion.util.Http


trait CtaApi extends Http {
  protected val ctaApiRoot: String

  def getTopComments(key: DiscussionKey): Future[List[Comment]] = {
    val ctaUrl: String = s"$ctaApiRoot/cta/article/${key.keyAsString}"
    def onError(r: Response) = s"Error loading CallToAction, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    def getFirstComment = (ctaJson: JsValue) => ((ctaJson \\ "components")(0) \\ "comments")(0)(0)



    def getComments(json: JsValue): List[Comment] = {
      val commentListJson: List[JsValue] = (((json \ "components")(0) \\ "comments")(0)).as[List[JsValue]]
      commentListJson.map(json => Comment(json))
    }

    getJsonOrError(ctaUrl, onError) map getComments
  }
}


