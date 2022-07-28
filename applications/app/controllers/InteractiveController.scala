package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse}
import common._
import conf.Configuration.interactive.cdnPath
import conf.switches.Switches
import contentapi.ContentApiClient
import implicits.{AmpFormat, HtmlFormat, JsonFormat}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{InteractivePage, _}
import model.content.InteractiveAtom
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import org.apache.commons.lang.StringEscapeUtils
import pages.InteractiveHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.{CAPILookup, USElection2020AmpPages, _}

import scala.concurrent.Future
import scala.concurrent.duration._

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

  def servePressedPage(path: String)(implicit request: RequestHeader): Future[Result] = {
    val cacheable = WithoutRevalidationResult(
      Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/www.theguardian.com/$path"),
    )
    Future.successful(Cached(CacheTime.ArchiveRedirect)(cacheable))
  }

  private def getWebWorkerPath(path: String, file: String, timestamp: Option[String]): String = {
    val stage = if (context.isPreview) "preview" else "live"
    val deployPath = timestamp.map(ts => s"$path/$ts").getOrElse(path)

    s"$cdnPath/service-workers/$stage/$deployPath/$file"
  }

  private def lookupItemResponse(path: String)(implicit request: RequestHeader): Future[ItemResponse] = {
    capiLookup.lookup(path, range = Some(ArticleBlocks))
  }

  def toModel(response: ItemResponse)(implicit
      request: RequestHeader,
  ): Either[(InteractivePage, Blocks), Result] = {
    val interactive = response.content map { Interactive.make }
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())
    val page = interactive.map(i => InteractivePage(i, StoryPackages(i.metadata.id, response)))

    ModelOrResult(page, response) match {
      case Left(page)       => Left((page, blocks))
      case Right(exception) => Right(exception)
    }
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)

  def renderNonDCR(page: InteractivePage)(implicit request: RequestHeader): Future[Result] = {
    val htmlResponse = () => InteractiveHtmlPage.html(page)
    val jsonResponse = () => views.html.fragments.interactiveBody(page)
    val res = renderFormat(htmlResponse, jsonResponse, page, Switches.all)
    Future.successful(res)
  }

  def renderHtml(page: InteractivePage, blocks: Blocks)(implicit request: RequestHeader): Future[Result] = {
    val pageType = PageType.apply(page, request, context)
    remoteRenderer.getInteractive(wsClient, page, blocks, pageType)
  }

  def renderJson(page: InteractivePage, blocks: Blocks)(implicit request: RequestHeader): Future[Result] = {
    val data =
      DotcomRenderingDataModel.forInteractive(page, blocks, request, PageType.apply(page, request, context))
    val dataJson = DotcomRenderingDataModel.toJson(data)
    val res = common.renderJson(dataJson, page).as("application/json")
    Future.successful(res)
  }

  def renderAmp(page: InteractivePage, blocks: Blocks)(implicit request: RequestHeader): Future[Result] = {
    val pageType = PageType.apply(page, request, context)
    remoteRenderer.getAMPInteractive(wsClient, page, blocks, pageType)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val requestFormat = request.getRequestFormat
    val isUSElectionAMP = USElection2020AmpPages.pathIsSpecialHanding(path) && requestFormat == AmpFormat

    def render(model: Either[(InteractivePage, Blocks), Result]): Future[Result] = {
      model match {
        case Left((page, blocks)) => {
          val tier = InteractivePicker.getRenderingTier(path)

          (requestFormat, tier) match {
            case (AmpFormat, DotcomRendering)     => renderAmp(page, blocks)
            case (JsonFormat, DotcomRendering)    => renderJson(page, blocks)
            case (HtmlFormat, PressedInteractive) => servePressedPage(path)
            case (HtmlFormat, DotcomRendering)    => renderHtml(page, blocks)
            case _                                => renderNonDCR(page)
          }
        }
        case Right(result) => Future.successful(result)
      }
    }

    if (isUSElectionAMP) { // A special-cased AMP page for various US Election (2020) interactive pages.
      renderUSElectionAMPPage(path)
    } else {
      val res = for {
        resp <- lookupItemResponse(path)
        model = toModel(resp)
        result <- render(model)
      } yield result

      res.recover(convertApiExceptionsWithoutEither)
    }
  }

  def renderUSElectionAMPPage(path: String)(implicit request: RequestHeader): Future[Result] = {
    // We use the same AMP atom/page for various US election pages.
    val capiPath = USElection2020AmpPages.pathToAmpAtomId(path)
    val response = lookupItemResponse(capiPath)

    response.map { response =>
      response.interactive match {
        case Some(atom) => {
          val interactive = InteractiveAtom.make(atom)
          Ok(StringEscapeUtils.unescapeHtml(interactive.html)).as("text/html")
        }
        case None => Ok("error: 6a0a6be4-e702-4b51-8f26-01f9921c6b74")
      }
    }
  }
}
