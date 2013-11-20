package controllers

import play.api.mvc.{AnyContent, Action}
import play.api.libs.json.JsValue
import common.JsonComponent
import model.Cached
import discussion.model.Comment

import scala.concurrent._
import ExecutionContext.Implicits.global
import conf.Configuration
import play.api.libs.ws.Response
import discussion.util.Http

trait CtaController extends DiscussionController with OpenCtaApi {

  def cta(shortUrl: String): Action[AnyContent] = Action.async {
    implicit request => {
      def renderCtaJson  = (json:JsValue) => Cached(60)(JsonComponent("html" -> views.html.fragments.commentCta(Comment(json))))
      getTopComment map renderCtaJson
    }
  }
}

trait OpenCtaApi extends Http {

  def getTopComment : Future[JsValue] = {
    def onError(r: Response) = s"Error loading CallToAction, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val ctaUrl: String = Configuration.open.ctaApiRoot + "/ctasforarticle/123"
    def getFirstComment = (ctaJson: JsValue) => ((ctaJson \\ "components")(0) \\ "comments")(0)(0)

    getJsonOrError(ctaUrl, onError) map getFirstComment
  }
}