package controllers

import com.gu.contentapi.client.model.v1.ContentType
import common.{GuLogging, ImplicitControllerExecutionContext}
import contentapi.ContentApiClient
import model.{ApplicationContext, ArticleBlocks, GenericFallback}
import play.api.libs.json.{JsError, JsSuccess, JsValue}
import play.api.mvc.{Action, BaseController, ControllerComponents}
import services.CAPILookup
import utils.LiveHarness.inject
import utils.LiveHarnessInteractiveAtom

import scala.concurrent.Future

class LiveHarnessController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    articleController: ArticleController,
    interactiveController: InteractiveController,
)(implicit val context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  private val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  def renderLiveHarness(path: String): Action[JsValue] = Action.async(
    // We allow a larger payload here to accommodate server-side rendered atoms, which can be larger than
    // the Play default of 100kb - see https://www.playframework.com/documentation/3.0.x/ScalaBodyParsers#Max-content-length
    parse.json(maxLength = 2048 * 1024),
  ) { implicit request =>
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
