package commercial.controllers

import common.{ImplicitControllerExecutionContext, GuLogging}
import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc._

class PiggybackPixelController(val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with implicits.Requests
    with GuLogging {

  def resize(): Action[AnyContent] =
    Action { implicit request =>
      val maybeJs = for {
        width <- request.getIntParameter("width")
        height <- request.getIntParameter("height")
      } yield {
        Cached(3600) { RevalidatableResult.Ok(templates.js.piggybackResize(width, height)) }
      }
      maybeJs getOrElse NotFound

    }
}
