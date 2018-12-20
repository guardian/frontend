package controllers

// import scala.concurrent.ExecutionContext.Implicits.global

import com.gu.contentapi.client.model.AtomUsageQuery
import com.gu.contentapi.client.model.v1.AtomUsageResponse
import com.gu.contentatom.thrift.AtomType.Media
import common.{ImplicitControllerExecutionContext, Logging}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import contentapi.ContentApiClient
import model.Cached
import model.Cached.RevalidatableResult

import scala.concurrent.Future

class YoutubeController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)  extends BaseController with Logging with ImplicitControllerExecutionContext {
  def getAtomId(id: String): Action[AnyContent] = Action.async { implicit request =>
    contentApiClient.getResponse(AtomUsageQuery(Media, id)).map{ response: AtomUsageResponse =>
      Cached(0)(RevalidatableResult.Ok(response.userTier))
    }
  }
}


