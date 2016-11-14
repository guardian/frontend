package commercial.controllers

import common.{ExecutionContexts, Logging}
import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc._

class PiggybackPixelController extends Controller with ExecutionContexts with implicits.Requests with Logging {

  def resize() = Action { implicit request =>
    val maybeJs = for {
      width <- request.getIntParameter("width")
      height <- request.getIntParameter("height")
    } yield {
      Cached(3600) { RevalidatableResult.Ok(templates.js.piggybackResize(width, height)) }
    }
    maybeJs getOrElse NotFound

  }
}