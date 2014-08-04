package controllers

import com.gu.googleauth.UserIdentity
import common.ExecutionContexts
import conf.Configuration
import play.api.libs.Comet
import play.api.mvc.Controller
import services.ContentApiRefresh

import scala.util.{Failure, Success}
import auth.ExpiringActions

/** Utility endpoint for forcing updates to Content API.
  *
  * NB: We had this initially because there were problems with the updates being pushed to Content API occasionally
  * and we needed to be able to quickly fix it for MAPI's sake. If this is now working, we might want to remove this.
  * Or we might want to keep it, just in case, as it allows us to quickly ensure Content API is up to date with Facia
  * Tool.
  */
object ContentApiPressController extends Controller with ExecutionContexts {
  def publishAll() = ExpiringActions.ExpiringAuthAction { request =>
    Ok(views.html.publish_all(Configuration.environment.stage, UserIdentity.fromRequest(request)))
  }

  def publishAllStream() = ExpiringActions.ExpiringAuthAction { request =>
    Ok.chunked((ContentApiRefresh.refresh() map {
      case (collectionId, Success(_)) => s"Successfully published $collectionId"
      case (collectionId, Failure(error)) => s"Failed to publish $collectionId: ${error.getMessage}"
    }) through Comet(callback = "parent.cometMessage"))
  }
}
