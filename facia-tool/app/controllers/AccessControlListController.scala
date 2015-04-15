package controllers

import acl.Table
import auth.ExpiringActions
import play.api.libs.json.Json
import play.api.mvc.{Controller, Action}
import scala.concurrent.ExecutionContext.Implicits.global

// For now we only do access control for the breaking news tool. In the future this will be integrated with Panda auth.
object FaciaToolAccessControlList {
  implicit val jsonWrites = Json.writes[FaciaToolAccessControlList]
}

case class FaciaToolAccessControlList(
  breakingNews: Boolean
)

object AccessControlListController extends Controller {
  def test() = ExpiringActions.ExpiringAuthAction.async { request =>
    Table.hasBreakingNewsAccess(request.user.email) map { hasAccess =>
      Ok(Json.toJson(FaciaToolAccessControlList(
        breakingNews = hasAccess
      )))
    }
  }
}
