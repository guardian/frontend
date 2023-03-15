package controllers

import com.gu.contentapi.client.model.{Direction, FollowingSearchQuery, SearchQuery}
import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model._
import pages.ContentHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.ImageQuery
import views.support.RenderOtherStatus
import play.api.libs.json._
import conf.Configuration.contentApi

import scala.concurrent.Future

case class ImageContentPage(image: ImageContent, related: RelatedContent) extends ContentPage {
  override lazy val item: ImageContent = image
}

class ImageContentController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    wsClient: WSClient,
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with ImageQuery
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderJson(path: String): Action[AnyContent] = render(path)

  def render(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  private def renderImageContent(page: ImageContentPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => ContentHtmlPage.html(page)
    val jsonResponse = () => views.html.fragments.imageContentBody(page)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] =
    image(Edition(request), path).map {
      case Right(content) => renderImageContent(content)
      case Left(result)   => RenderOtherStatus(result)
    }

  private def isSupported(c: ApiContent) = c.isImageContent
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)

  def getNextLightboxJson(path: String, tag: String, direction: String): Action[AnyContent] =
    Action.async { implicit request =>
      val capiQuery = FollowingSearchQuery(
        SearchQuery().tag(tag).showTags("all").showElements("image").pageSize(contentApi.nextPreviousPageSize),
        path,
        Direction.forPathSegment(direction),
      )

      contentApiClient.thriftClient.getResponse(capiQuery).map { response =>
        val lightboxJson = response.results.flatMap(result =>
          Content(result) match {
            case content: ImageContent => Some(content.lightBox.javascriptConfig)
            case _                     => None
          },
        )
        Cached(CacheTime.Default)(JsonComponent.fromWritable(JsArray(lightboxJson)))
      }
    }
}
