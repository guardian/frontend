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
import model.content.InteractiveAtom
import model.dotcomrendering.PageType
import org.apache.commons.lang.StringEscapeUtils
import pages.InteractiveHtmlPage
import renderers.DotcomRenderingService
import services.ApplicationsUSElection2020AmpPages
import services.ApplicationsUSElection2020AmpPages.pathToAmpAtomId

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

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    ApplicationsInteractiveRendering.getRenderingTier(path) match {
      case Regular => {
        lookup(path) map {
          case Left(model)  => render(model)
          case Right(other) => RenderOtherStatus(other)
        }
      }
      case USElection2020AmpPage => renderInteractivePageUSPresidentialElection2020(path)
      case DotcomRendering => {
        // On purpose reproduce Regular [work in progress]
        lookup(path) map {
          case Left(model)  => render(model)
          case Right(other) => RenderOtherStatus(other)
        }
      }
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
          Ok(StringEscapeUtils.unescapeHtml(interactive.html)).withHeaders("Content-Type" -> "text/html")
        }
        case None => Ok("error: 6a0a6be4-e702-4b51-8f26-01f9921c6b74")
      }
    }
  }
}
