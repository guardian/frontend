package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
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
import services.ApplicationsUSElection2020AmpPages
import services.ApplicationsUSElection2020AmpPages.pathToAmpAtomId
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

  private def lookup(
      path: String,
  )(implicit request: RequestHeader): Future[Either[(InteractivePage, Blocks), Result]] = {
    val result = capiLookup.lookup(path, range = Some(ArticleBlocks)) map { response =>
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

  private def lookupWithoutModelConvertion(path: String): Future[ItemResponse] = {
    val edition = Edition.defaultEdition
    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all")
        .showAtoms("all"),
    )
    response
  }

  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => InteractiveHtmlPage.html(model)
    val jsonResponse = () => views.html.fragments.interactiveBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)

  def renderItemLegacy(path: String)(implicit request: RequestHeader): Future[Result] = {
    lookup(path) map {
      case Left((model, _)) => render(model)
      case Right(other)     => RenderOtherStatus(other)
    }
  }

  def renderDCR(path: String)(implicit request: RequestHeader): Future[Result] = {
    lookup(path) flatMap {
      case Left((model, blocks)) => {
        val pageType = PageType.apply(model, request, context)
        remoteRenderer.getInteractive(wsClient, model, blocks, pageType)
      }
      case Right(other) => Future.successful(RenderOtherStatus(other))
    }
  }

  def renderDCRJson(path: String)(implicit request: RequestHeader): Future[Result] = {
    lookup(path) map {
      case Left((model, blocks)) => {
        val data =
          DotcomRenderingDataModel.forInteractive(model, blocks, request, PageType.apply(model, request, context))
        val dataJson = DotcomRenderingDataModel.toJson(data)
        common.renderJson(dataJson, model).as("application/json")
      }
      case Right(other) => RenderOtherStatus(other)
    }
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val requestFormat = request.getRequestFormat
    val renderingTier = InteractiveRendering.getRenderingTier(path)
    (requestFormat, renderingTier) match {
      case (AmpFormat, USElectionTracker2020AmpPage) => renderInteractivePageUSPresidentialElection2020(path)
      case (JsonFormat, _) if request.forceDCR       => renderDCRJson(path)
      case (HtmlFormat, DotcomRendering)             => renderDCR(path)
      case _                                         => renderItemLegacy(path)
    }
  }

  // ---------------------------------------------
  // US Presidential Election 2020

  def renderInteractivePageUSPresidentialElection2020(path: String): Future[Result] = {
    /*
      This version retrieve the AMP version directly but rely on a predefined map between paths and amp page ids
     */
    val capiLookupString = ApplicationsUSElection2020AmpPages.pathToAmpAtomId(path)
    val response: Future[ItemResponse] = lookupWithoutModelConvertion(capiLookupString)
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
