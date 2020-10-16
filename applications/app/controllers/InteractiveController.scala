package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import conf.switches.Switches
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support.RenderOtherStatus
import conf.Configuration.interactive.cdnPath
import model.dotcomrendering.PageType
import pages.InteractiveHtmlPage
import renderers.DotcomRenderingService

import scala.concurrent.duration._
import scala.concurrent.Future
import services.{CAPILookup, _}

case class InteractivePage(interactive: Interactive, related: RelatedContent) extends ContentPage {
  override lazy val item = interactive
}

class InteractiveController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with Logging
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

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[InteractivePage, Result]] = {
    val edition = Edition(request)
    log.info(s"Fetching interactive: $path for edition $edition")
    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all")
        .showAtoms("all"),
    )

    val result = response map { response =>
      val interactive = response.content map { Interactive.make }
      val page = interactive.map(i => InteractivePage(i, StoryPackages(i.metadata.id, response)))

      ModelOrResult(page, response)
    }

    result recover convertApiExceptions
  }

  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => InteractiveHtmlPage.html(model)
    val jsonResponse = () => views.html.fragments.interactiveBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    ApplicationsDotcomRenderingInterface.getRenderingTier(request) match {
      case Legacy => {
        lookup(path) map {
          case Left(model)  => render(model)
          case Right(other) => RenderOtherStatus(other)
        }
      }
      case DotcomRendering => {
        val remoteRenderer = DotcomRenderingService()
        val range = ArticleBlocks

        capiLookup
          .lookup(path, Some(range))
          .map(responseToModelOrResult)
          .recover(convertApiExceptions) // Future[Either[(ArticlePage, Blocks), Result]]
          .flatMap { e =>
            e match {
              case Left((article, blocks)) => {
                val pageType: PageType = PageType(article, request, context)
                remoteRenderer.getAMPArticle(wsClient, article, blocks, pageType)
              }
              case Right(other) => Future.successful(Ok("Experiment 2"))
            }
          }

        // val html: String = ApplicationsDotcomRenderingInterface.getHtmlFromDCR()
        // Future.successful(Ok(html))
      }
    }
  }

  // ---------------------------------------------
  // ongoing [applications] on DCR experiment

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku

  private def responseToModelOrResult(
      response: ItemResponse,
  )(implicit request: RequestHeader): Either[(ArticlePage, Blocks), Result] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())

    ModelOrResult(supportedContent, response) match {
      case Left(article: Article) => Left((ArticlePage(article, StoryPackages(article.metadata.id, response)), blocks))
      case Right(r)               => Right(r)
      case _                      => Right(NotFound)
    }
  }
}
