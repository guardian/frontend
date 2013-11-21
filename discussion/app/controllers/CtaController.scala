package controllers

import play.api.mvc.{AnyContent, Action}
import play.api.libs.json.JsValue
import model.Cached
import common.JsonComponent
import discussion.model.{DiscussionKey, Comment}
import discussion.api.CtaApi

trait CtaController extends DiscussionController with CtaApi {

  def cta(key: DiscussionKey): Action[AnyContent] = Action.async {
    implicit request => {
      def renderCtaJson = (json: JsValue) => Cached(60)(JsonComponent("html" -> views.html.fragments.commentCta(Comment(json))))
      getTopComment(key) map renderCtaJson
    }
  }
}
