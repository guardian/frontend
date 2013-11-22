package controllers

import play.api.mvc.{Controller, AnyContent, Action}
import play.api.libs.json.JsValue
import model.Cached
import common.{ExecutionContexts, JsonComponent}
import discussion.model.{DiscussionKey, Comment}
import discussion.api.CtaApi
import conf.Configuration

trait CtaController extends CtaApi with Controller with ExecutionContexts with implicits.Requests {

  def cta(key: DiscussionKey): Action[AnyContent] = Action.async {
    implicit request => {
      def renderCtaJson = (comments: List[Comment]) => Cached(60)(JsonComponent("html" -> views.html.fragments.ctaTopComments(comments)))
      getTopComments(key) map renderCtaJson
    }
  }
}

object CtaController extends CtaController {
  protected val ctaApiRoot: String = Configuration.open.ctaApiRoot
}
