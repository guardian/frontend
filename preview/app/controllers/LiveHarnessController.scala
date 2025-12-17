package controllers

import com.gu.contentapi.client.model.v1.ContentType
import common.{GuLogging, ImplicitControllerExecutionContext}
import contentapi.ContentApiClient
import model.{ApplicationContext, ArticleBlocks, GenericFallback}
import play.api.libs.json.{JsError, JsSuccess, JsValue}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, BaseController, ControllerComponents}
import renderers.DotcomRenderingService
import services.{CAPILookup, NewsletterService}
import utils.LiveHarness.inject
import utils.LiveHarnessInteractiveAtom

import scala.concurrent.Future

class LiveHarnessController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    newsletterService: NewsletterService,
)(implicit val context: ApplicationContext)
    extends BaseController
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

  def renderLiveHarness(path: String): Action[JsValue] = Action.async(parse.json) { implicit request =>
    request.body.validate[List[LiveHarnessInteractiveAtom]] match {
      case JsSuccess(atoms, _) =>
        capiLookup.lookup(path, Some(ArticleBlocks)).flatMap { response =>
          response.content
            .map(_.`type`)
            .collect {
              case ContentType.Article     => articleController.mapAndRender(path, GenericFallback)(inject(atoms))
              case ContentType.Interactive => interactiveController.modelAndRenderHtml(response)(inject(atoms))
            }
            .getOrElse(Future(BadRequest))
        }
      case JsError(errors) => Future(BadRequest(errors.toString()))
    }
  }
}
