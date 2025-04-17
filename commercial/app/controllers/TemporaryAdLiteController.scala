package commercial.controllers

import play.api.mvc._

import scala.concurrent.duration._
import model.Cached
import model.Cached.WithoutRevalidationResult

/*
 * Temporarily enable ad-lite for a user by setting a short lived cookie, used for demoing ad-lite to advertisers
 */

class TemporaryAdLiteController(val controllerComponents: ControllerComponents) extends BaseController {

  private val lifetime: Int = 1.hours.toSeconds.toInt

  def enable(): Action[AnyContent] = Action { implicit request =>
    Cached(60)(
      WithoutRevalidationResult(
        SeeOther("/").withCookies(
          Cookie("gu_allow_reject_all", lifetime.toString(), maxAge = Some(lifetime), httpOnly = false),
        ),
      ),
    )
  }

  def disable(): Action[AnyContent] = Action { implicit request =>
    Cached(60)(
      WithoutRevalidationResult(
        SeeOther("/").discardingCookies(DiscardingCookie("gu_allow_reject_all")),
      ),
    )
  }
}
