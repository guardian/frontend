package controllers

import com.gu.contentapi.client.model.v1.{Blocks, CapiDateTime, ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import conf.switches.Switches
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import model.InteractivePage
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support.RenderOtherStatus
import conf.Configuration.interactive.cdnPath
import model.content.InteractiveAtom
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import org.apache.commons.lang.StringEscapeUtils
import pages.InteractiveHtmlPage
import renderers.DotcomRenderingService
import services.USElection2020AmpPages
import services.InteractivePickerInputData
import implicits.{AmpFormat, EmailFormat, HtmlFormat, JsonFormat}

import scala.concurrent.duration._
import scala.concurrent.Future
import services.{CAPILookup, _}

class InteractiveController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with GuLogging
    with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  def proxyInteractiveWebWorker(path: String, file: String): Action[AnyContent] =
    Action.async { implicit request =>
      val timestamp = request.getQueryString("timestamp")
      val serviceWorkerPath = getWebWorkerPath(path, file, timestamp)

      wsClient.url(serviceWorkerPath).get().map { response =>
        Cached(365.days) {
          response.status match {
            case 200 =>
              val contentType = response.headers("Content-Type").mkString(",")
              RevalidatableResult(Ok(response.body).as(contentType), response.body)
            case otherStatus => WithoutRevalidationResult(new Status(otherStatus))
          }
        }
      }
    }

  private def getWebWorkerPath(path: String, file: String, timestamp: Option[String]): String = {
    val stage = if (context.isPreview) "preview" else "live"
    val deployPath = timestamp.map(ts => s"$path/$ts").getOrElse(path)

    s"$cdnPath/service-workers/$stage/$deployPath/$file"
  }

  private def lookupItemResponse(path: String)(implicit request: RequestHeader): Future[ItemResponse] = {
    capiLookup.lookup(path, range = Some(ArticleBlocks))
  }

  def itemResponseToModel(item: Future[ItemResponse])(implicit
      request: RequestHeader,
  ): Future[Either[(InteractivePage, Blocks), Result]] = {
    val result = item map { response =>
      val interactive = response.content map { Interactive.make }
      val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())
      val page = interactive.map(i => InteractivePage(i, StoryPackages(i.metadata.id, response)))

      ModelOrResult(page, response) match {
        case Left(page)       => Left((page, blocks))
        case Right(exception) => Right(exception)
      }
    }
    result recover convertApiExceptions
  }

  private def lookup(
      path: String,
  )(implicit request: RequestHeader): Future[Either[(InteractivePage, Blocks), Result]] = {
    itemResponseToModel(lookupItemResponse(path: String))
  }

  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => InteractiveHtmlPage.html(model)
    val jsonResponse = () => views.html.fragments.interactiveBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)

  def renderItemLegacy(item: ItemResponse)(implicit request: RequestHeader): Future[Result] = {
    itemResponseToModel(Future.successful(item)) map {
      case Left((model, _)) => render(model)
      case Right(other)     => RenderOtherStatus(other)
    }
  }

  def renderDCR(item: ItemResponse)(implicit request: RequestHeader): Future[Result] = {
    itemResponseToModel(Future.successful(item)) flatMap {
      case Left((model, blocks)) => {
        val pageType = PageType.apply(model, request, context)
        remoteRenderer.getInteractive(wsClient, model, blocks, pageType)
      }
      case Right(other) => Future.successful(RenderOtherStatus(other))
    }
  }

  def renderDCRJson(item: ItemResponse)(implicit request: RequestHeader): Future[Result] = {
    itemResponseToModel(Future.successful(item)) map {
      case Left((model, blocks)) => {
        val data =
          DotcomRenderingDataModel.forInteractive(model, blocks, request, PageType.apply(model, request, context))
        val dataJson = DotcomRenderingDataModel.toJson(data)
        common.renderJson(dataJson, model).as("application/json")
      }
      case Right(other) => RenderOtherStatus(other)
    }
  }

  def renderDCRAmp(item: ItemResponse)(implicit request: RequestHeader): Future[Result] = {
    itemResponseToModel(Future.successful(item)) flatMap {
      case Left((model, blocks)) => {
        val pageType = PageType.apply(model, request, context)
        remoteRenderer.getAMPInteractive(wsClient, model, blocks, pageType)
      }
      case Right(other) => Future.successful(RenderOtherStatus(other))
    }
  }

  def itemResponseToInteractivePickerInputData(item: ItemResponse)(implicit
      request: RequestHeader,
  ): Option[InteractivePickerInputData] = {
    for {
      datetime <- item.content.flatMap(_.webPublicationDate)
      tags <- item.content.map(_.tags)
    } yield InteractivePickerInputData(datetime, tags.toList)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val requestFormat = request.getRequestFormat
    lookupItemResponse(path).flatMap { itemResponse =>
      itemResponseToInteractivePickerInputData(itemResponse) match {
        case Some(data) => {
          val renderingTier = InteractivePicker.getRenderingTier(path, data)
          (requestFormat, renderingTier) match {
            case (AmpFormat, USElectionTracker2020AmpPage) => renderInteractivePageUSPresidentialElection2020(path)
            case (AmpFormat, DotcomRendering)              => renderDCRAmp(itemResponse)
            case (JsonFormat, _) if request.forceDCR       => renderDCRJson(itemResponse)
            case (HtmlFormat, DotcomRendering)             => renderDCR(itemResponse)
            case _                                         => renderItemLegacy(itemResponse)
          }
        }
        case None =>
          Future.successful(
            NotFound("Could not determine InteractivePicker input data [error: 915efe11-2287-45fe-be84-7f9d77d9bad1]"),
          )
      }
    }
  }

  // ---------------------------------------------
  // US Presidential Election 2020

  def renderInteractivePageUSPresidentialElection2020(path: String)(implicit request: RequestHeader): Future[Result] = {
    /*
      This version retrieve the AMP version directly but rely on a predefined map between paths and amp page ids
     */
    val capiLookupString = USElection2020AmpPages.pathToAmpAtomId(path)
    val response: Future[ItemResponse] = lookupItemResponse(capiLookupString)
    response.map { response =>
      response.interactive match {
        case Some(i2) => {
          val interactive = InteractiveAtom.make(i2)
          Ok(StringEscapeUtils.unescapeHtml(interactive.html)).as("text/html")
        }
        case None => Ok("error: 6a0a6be4-e702-4b51-8f26-01f9921c6b74")
      }
    }
  }
}
