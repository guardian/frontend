package controllers

import acl.Table
import auth.ExpiringActions
import play.api.libs.json._
import play.api.mvc.{Controller, Action}
import scala.concurrent.ExecutionContext.Implicits.global

// For now we only do access control for the breaking news tool. In the future this will be integrated with Panda auth.
object AccessControlListController extends Controller {
  def test() = ExpiringActions.ExpiringAuthAction.async { request =>
    Table.hasBreakingNewsAccess(request.user.email) map { hasAccess =>
      Ok(JsObject(Seq("breaking-news" -> JsBoolean(hasAccess))))
    }
  }
}
