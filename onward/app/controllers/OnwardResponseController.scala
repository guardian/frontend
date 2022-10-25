package controllers

import common.{ImplicitControllerExecutionContext, JsonComponent}
import feed.MostReadAgent
import model.{ApplicationContext, Cached}
import model.dotcomrendering.OnwardCollectionResponse
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import renderers.DotcomRenderingService
import services.PopularInTagService

import scala.concurrent.Future

class OnwardResponseController(
    ws: WSClient,
    remoteRenderer: DotcomRenderingService,
    popularInTagService: PopularInTagService,
    mostReadAgent: MostReadAgent,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {

  def popularInTag(tag: String)(implicit request: RequestHeader): Future[OnwardCollectionResponse] = {
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    val itemViewCounts = mostReadAgent.getViewCounts

    popularInTagService.fetch(tag, excludeTags, itemViewCounts)
  }
  def popularInTagJson(tag: String): Action[AnyContent] =
    Action.async { implicit request =>
      popularInTag(tag) map renderJson
    }

  private def renderJson(
      onwardsCollection: OnwardCollectionResponse,
  )(implicit request: RequestHeader): Result = {
    Cached(600) {
      JsonComponent
        .fromWritable[OnwardCollectionResponse](onwardsCollection)(
          request,
          OnwardCollectionResponse.collectionWrites,
        )
    }
  }
}
