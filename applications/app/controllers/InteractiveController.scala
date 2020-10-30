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
import services.ApplicationsSpecial2020Election
import services.ApplicationsSpecial2020Election.pathToAmpAtomId

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
    ApplicationsDotcomRenderingInterface.getRenderingTier(path) match {
      case Legacy => {
        lookup(path) map {
          case Left(model)  => render(model)
          case Right(other) => RenderOtherStatus(other)
        }
      }
      case Election2020Hack => renderInteractivePageElection2020_v2(path)
      case DotcomRendering => {
        val remoteRenderer = DotcomRenderingService()
        val range = ArticleBlocks

        val path2 = "world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance"
        capiLookup
          .lookup(path2, Some(range))
          .map(responseToModelOrResult)
          .recover(convertApiExceptions) // Future[Either[(ArticlePage, Blocks), Result]]
          .flatMap { e =>
            e match {
              case Left((article, blocks)) => {
                val pageType: PageType = PageType(article, request, context)
                remoteRenderer.getAMPArticle(wsClient, article, blocks, pageType)
              }
              case Right(other) => Future.successful(Ok("case: ade30b6a-de4a-469d-8ad8-701996e5be06"))
            }
          }

        // val html: String = ApplicationsDotcomRenderingInterface.getHtmlFromDCR()
        // Future.successful(Ok(html))
      }
    }
  }

  // ---------------------------------------------
  // Election2020

  def renderInteractivePageElection2020(i: InteractivePage): Future[Result] = {
    /*
      This version takes the interactive page, extract the atom id and then make
      another CAPI query (using a derived id) to retrieve the AMP version
     */
    val atomIdOpt = i.item.content.atoms.flatMap(atoms => atoms.interactives.headOption.map(atom => atom.id))
    atomIdOpt match {
      case Some(atomId) => {
        val capiLookupString = ApplicationsSpecial2020Election.defaultAtomIdToAmpAtomId(atomId)
        val response: Future[ItemResponse] = lookupWithoutModelConvertion(capiLookupString)
        response.map { response =>
          response.interactive match {
            case Some(i2) => {
              val interactive = InteractiveAtom.make(i2)
              Ok(StringEscapeUtils.unescapeHtml(interactive.html)).withHeaders("Content-Type" -> "text/html")
            }
            case None => Ok("error: 6523e5f4-c4fe-48f6-b307-8f6fb2cadf96")
          }
        }
      }
      case None => Future.successful(Ok("error: b62cfee4-cdc6-4e13-b965-89d4bd313039"))
    }
  }

  def renderInteractivePageElection2020_v2(path: String): Future[Result] = {
    /*
      This version retrieve the AMP version directly but rely on an predefined map between paths and amp page ids
     */
    ApplicationsSpecial2020Election.pathToAmpAtomId(path) match {
      case None =>
        Future.successful(Ok("error: 5ce31f26-6dfe-4981-aad0-5d858e6dba8a (amp document not available at this path)"))
      case Some(capiLookupString) => {
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
  }

  // ---------------------------------------------
  // [applications] on DCR experiment

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
