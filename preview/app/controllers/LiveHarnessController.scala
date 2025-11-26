package controllers

import com.gu.contentapi.client.model.v1.ContentType
import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, ArticleBlocks, GenericFallback}
import play.api.libs.json.JsValue
import play.api.mvc.{Action, BaseController, ControllerComponents}
import services.{CAPILookup, NewsletterService}
import utils.{LiveHarness, LiveHarnessInteractiveAtom}
import contentapi.ContentApiClient
import play.api.libs.ws.WSClient
import renderers.DotcomRenderingService

import scala.concurrent.Future

class LiveHarnessController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    newsletterService: NewsletterService,
)(implicit
    val
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  private val renderingService = DotcomRenderingService()

  private val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  private val articleController =
    new ArticleController(
      contentApiClient,
      controllerComponents,
      ws,
      renderingService,
      newsletterService,
    )

  private val interactiveController =
    new InteractiveController(
      contentApiClient,
      ws,
      controllerComponents,
      renderingService,
    )

  def renderLiveHarness(path: String): Action[JsValue] = {
    Action.async(parse.json) { implicit request =>
      request.body.validate[List[LiveHarnessInteractiveAtom]].asEither match {
        case Right(value) =>
          capiLookup.lookup(path, Some(ArticleBlocks)).flatMap { response =>
            {
              response.content.map(_.`type`) match {
                case Some(ContentType.Article) =>
                  articleController.mapModel(path, GenericFallback)((article, blocks) => {
                    val (newArticle, newBlocks) = LiveHarness.injectInteractiveAtomsIntoPage(value, article, blocks)
                    articleController.render(path, newArticle, newBlocks)
                  })
                case Some(ContentType.Interactive) =>
                  interactiveController.toModel(response) match {
                    case Left(errorResult) =>
                      Future.successful(errorResult)
                    case Right((page, blocks)) =>
                      val (newArticle, newBlocks) =
                        LiveHarness.injectInteractiveAtomsIntoPage(value, page, blocks)
                      interactiveController.renderHtml(newArticle, newBlocks)
                  }
                case _ => Future(BadRequest)
              }
            }
          }
        case Left(value) => Future(BadRequest(value.toString()))
      }
    }
  }
}
