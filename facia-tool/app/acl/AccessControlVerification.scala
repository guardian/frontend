package acl

import com.gu.googleauth.UserIdentity
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

object AuthorizationError {
  implicit val jsonWrites = Json.writes[AuthorizationError]
}

case class AuthorizationError(
  errorMessage: String,
  missingPermission: String
)

trait AccessControlVerification { self: Controller =>
  def withModifyPermissionForCollection[A](id: String)(block: => Future[Result])
      (implicit request: Security.AuthenticatedRequest[AnyContent, UserIdentity],
                executionContext: ExecutionContext) =
    withModifyPermissionForCollections(Set(id))(block)(request, executionContext)

  def withModifyPermissionForCollections[A](ids: Set[String])(block: => Future[Result])
      (implicit request: Security.AuthenticatedRequest[AnyContent, UserIdentity],
                executionContext: ExecutionContext): Future[Result] = {
    Table.hasBreakingNewsAccess(request.user.email) flatMap { hasAccess =>
      if (hasAccess) {
        block
      } else {
        Future.successful(Unauthorized(Json.toJson(AuthorizationError(
          "You do not have access to publish breaking news alerts",
          "breakingNews"
        ))))
      }
    }
  }
}
