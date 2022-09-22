package controllers

import common.{Edition, ImplicitControllerExecutionContext, JsonComponent, JsonNotFound}
import feed.MostReadAgent
import model.Cached.WithoutRevalidationResult
import model.dotcomrendering.OnwardCollectionResponse
import model.{ApplicationContext, Cached}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.{NoRelatedContentException, PopularInTagService, RelatedContentDisabledException, RelatedContentService}

import scala.concurrent.Future
import scala.concurrent.duration._

class OnwardResponseController(
    ws: WSClient,
    remoteRenderer: DotcomRenderingService,
    popularInTagService: PopularInTagService,
    relatedContentService: RelatedContentService,
    mostReadAgent: MostReadAgent,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {

  def popularInTag(tag: String)(implicit request: RequestHeader): Future[OnwardCollectionResponse] = {
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    val itemViewCounts = mostReadAgent.getViewCounts

    popularInTagService.fetch(edition, tag, excludeTags, itemViewCounts)
  }

  def related(pageId: String)(implicit request: RequestHeader): Future[OnwardCollectionResponse] = {
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)

    relatedContentService.fetch(edition, pageId, excludeTags)
  }

  def relatedJson(pageId: String): Action[AnyContent] =
    Action.async { implicit request =>
      related(pageId)
        .map(renderJson)
        .map(Cached(30.minutes))
        .recover {
          case RelatedContentDisabledException() | NoRelatedContentException() => Cached(10.minutes)(JsonNotFound())
        }
    }

  def popularInTagJson(tag: String): Action[AnyContent] =
    Action.async { implicit request =>
      popularInTag(tag)
        .map(renderJson)
        .map(Cached(10.minutes))
    }

  private def renderJson(
      onwardsCollection: OnwardCollectionResponse,
  )(implicit request: RequestHeader) = {
    JsonComponent
      .fromWritable[OnwardCollectionResponse](onwardsCollection)(
        request,
        OnwardCollectionResponse.collectionWrites,
      )
  }
}
