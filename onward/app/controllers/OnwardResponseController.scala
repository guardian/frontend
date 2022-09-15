package controllers

import com.gu.contentapi.client.model.{ContentApiError, ItemQuery}
import common.{Edition, GuLogging, ImplicitControllerExecutionContext, JsonComponent}
import feed.MostReadAgent
import model.{ApplicationContext, Cached, RelatedContent, RelatedContentItem, Tag}
import model.dotcomrendering.OnwardCollectionResponse
import models.Series
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import renderers.DotcomRenderingService
import services.{PopularInTagService, SeriesService}
import contentapi.ContentApiClient

import scala.concurrent.Future

class OnwardResponseController(
    ws: WSClient,
    remoteRenderer: DotcomRenderingService,
    popularInTagService: PopularInTagService,
    seriesService: SeriesService,
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

  def series(seriesId: String)(implicit request: RequestHeader): Future[Option[OnwardCollectionResponse]] = {
    val edition = Edition(request)
    seriesService.fetch(edition, seriesId)
  }

  def seriesJson(seriesId: String): Action[AnyContent] =
    Action.async { implicit request =>
      series(seriesId).flatMap {
        case Some(onwardCollectionResponse) => renderJson(onwardCollectionResponse)
        case None => NotFound
      }
    }

    def seriesHtml(seriesId: String): Action[AnyContent] =
      Action.async { implicit request =>
        series(seriesId).flatMap {
          case Some(onwardCollectionResponse) => renderHtml(onwardCollectionResponse)
          case None => NotFound
        }
      }
}
