package controllers

import com.gu.contentapi.client.model.v1.{Block, ItemResponse, Content => ApiContent}
import com.gu.contentapi.client.model.{Direction, FollowingSearchQuery, SearchQuery}
import common._
import conf.Configuration.contentApi
import conf.switches.Switches
import contentapi.ContentApiClient
import implicits.{AppsFormat, JsonFormat}
import model._
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import pages.ContentHtmlPage
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.ImageQuery
import services.dotcomrendering.{ImageContentPicker, RemoteRender}
import views.support.RenderOtherStatus

import com.gu.contentapi.client.model.Direction.Next
import com.gu.contentapi.client.model.Direction.Previous
import java.time.{LocalDate, LocalDateTime, LocalTime, ZoneOffset}
import scala.concurrent.Future
import scala.util.Try
import java.time.format.DateTimeFormatter

class ImageContentController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    wsClient: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
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
    image(Edition(request), path).flatMap {
      case Right((content, mainBlock)) =>
        val tier = ImageContentPicker.getTier(content)

        tier match {
          case RemoteRender => remoteRender(content, mainBlock)
          case _            => Future.successful(renderImageContent(content))
        }
      case Left(result) => Future.successful(RenderOtherStatus(result))
    }

  private def getDCRJson(content: ImageContentPage, pageType: PageType, mainBlock: Option[Block])(implicit
      request: RequestHeader,
  ): String = {
    DotcomRenderingDataModel.toJson(DotcomRenderingDataModel.forImageContent(content, request, pageType, mainBlock))
  }

  private def remoteRender(content: ImageContentPage, mainBlock: Option[Block])(implicit
      request: RequestHeader,
  ): Future[Result] = {
    val pageType = PageType(content, request, context)

    request.getRequestFormat match {
      case JsonFormat =>
        Future.successful(
          common.renderJson(getDCRJson(content, pageType, mainBlock), content).as("application/json"),
        )
      case AppsFormat =>
        remoteRenderer.getAppsImageContent(
          wsClient,
          content,
          pageType,
          mainBlock,
        )
      case _ =>
        remoteRenderer.getImageContent(
          wsClient,
          content,
          pageType,
          mainBlock,
        )
    }
  }

  private def isSupported(c: ApiContent) = c.isImageContent
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)

  private lazy val dateExtractor = """.+/(\d{4})/(\w{3})/(\d{2})/.+""".r

  def getNextLightboxJson(path: String, tag: String, rawDirection: String): Action[AnyContent] =
    Action.async { implicit request =>
      val direction = Direction.forPathSegment(rawDirection)

      /** unfortunately we have to infer the date from the path, because getting the real publication date would require
        * another call to the content API…
        */
      val date = (path match {
        case dateExtractor(rawYear, rawMonth, rawDate) => {
          (Try(rawYear.toInt).toOption, rawMonth, Try(rawDate.toInt).toOption) match {
            case (Some(year), "jan", Some(day)) => Some(LocalDate.of(year, 1, day))
            case (Some(year), "feb", Some(day)) => Some(LocalDate.of(year, 2, day))
            case (Some(year), "mar", Some(day)) => Some(LocalDate.of(year, 3, day))
            case (Some(year), "apr", Some(day)) => Some(LocalDate.of(year, 4, day))
            case (Some(year), "may", Some(day)) => Some(LocalDate.of(year, 5, day))
            case (Some(year), "jun", Some(day)) => Some(LocalDate.of(year, 6, day))
            case (Some(year), "jul", Some(day)) => Some(LocalDate.of(year, 7, day))
            case (Some(year), "aug", Some(day)) => Some(LocalDate.of(year, 8, day))
            case (Some(year), "sep", Some(day)) => Some(LocalDate.of(year, 9, day))
            case (Some(year), "oct", Some(day)) => Some(LocalDate.of(year, 10, day))
            case (Some(year), "nov", Some(day)) => Some(LocalDate.of(year, 11, day))
            case (Some(year), "dec", Some(day)) => Some(LocalDate.of(year, 12, day))
            case _                              => None
          }
        }
        case _ => None
      })
      val instant = date.map(LocalDateTime.of(_, LocalTime.MIDNIGHT).toInstant(ZoneOffset.UTC))
      val query =
        SearchQuery().tag(tag).showTags("all").showElements("image,cartoon").pageSize(contentApi.nextPreviousPageSize);

      val capiQuery = FollowingSearchQuery(
        direction match {
          case Previous => query.fromDate(instant)
          case Next     => query.toDate(instant)
        },
        path,
        direction,
      )

      contentApiClient.thriftClient.getResponse(capiQuery).map { response =>
        val lightboxJson = response.results.flatMap { result =>
          println("TAGS****")
          println(result.tags.map(t => t.id))
          println(result.elements)
          Content(result) match {
            case content: ImageContent => Some(content.lightBox.javascriptConfig)
            case _                     => None
          }
        }

        if (request.forceDCR) {
          val timeDirection = direction match {
            case Next     => "past"
            case Previous => "future"
          }

          Cached(CacheTime.Default)(
            JsonComponent.fromWritable(
              Json.obj(
                "total" -> response.total,
                "direction" -> timeDirection,
                "date" -> date,
                "images" -> JsArray(lightboxJson),
              ),
            ),
          )
        } else
          Cached(CacheTime.Default)(JsonComponent.fromWritable(JsArray(lightboxJson)))

      }
    }
}
