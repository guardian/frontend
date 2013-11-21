package discussion.api

import play.api.libs.json.JsValue
import scala.concurrent._
import ExecutionContext.Implicits.global
import play.api.libs.ws.Response
import discussion.model.DiscussionKey
import discussion.util.Http
import conf.Configuration


trait CtaApi extends Http {
   // val ctaApiRoot: String TODO: DEfine this when u are back from lunch --Ikenna

  def getTopComment(key: DiscussionKey): Future[JsValue] = {
    val ctaUrl: String = Configuration.open.ctaApiRoot + "/article/cta/" + key.keyAsString
    def onError(r: Response) = s"Error loading CallToAction, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    def getFirstComment = (ctaJson: JsValue) => ((ctaJson \\ "components")(0) \\ "comments")(0)(0)

    getJsonOrError(ctaUrl, onError) map getFirstComment
  }
}


