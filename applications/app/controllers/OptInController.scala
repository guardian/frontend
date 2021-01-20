package controllers

import experiments.ParticipationGroups
import model.Cached
import model.Cached.WithoutRevalidationResult
import play.api.mvc._

import scala.concurrent.duration._

/*
 * Opting in a flag: /opt/in/name-of-the-flag
 * Opting out a flag: /opt/out/name-of-the-flag
 * Deleting the cookie for a given flag: /opt/delete/name-of-the-flag
 * Delete all cookies: /opt/reset
 */

class OptInController(val controllerComponents: ControllerComponents) extends BaseController {

  private val lifetime: Int = 90.days.toSeconds.toInt

  private def opt(feature: String, choice: String): Result =
    choice match {
      case "in"     => optIn(feature)
      case "out"    => optOut(feature)
      case "delete" => optDelete(feature)
    }
  def optIn(cookieName: String): Result = SeeOther("/").withCookies(Cookie(cookieName, "true", maxAge = Some(lifetime)))
  def optOut(cookieName: String): Result = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
  def optDelete(cookieName: String): Result = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))

  def reset(): Action[AnyContent] =
    Action { implicit request =>
      val discardingCookies = ParticipationGroups.values.map(group => DiscardingCookie(group.headerName))
      Cached(60)(
        WithoutRevalidationResult(
          SeeOther("/").discardingCookies(discardingCookies: _*),
        ),
      )
    }

  def handle(feature: String, choice: String): Action[AnyContent] =
    Action { implicit request =>
      Cached(60)(
        WithoutRevalidationResult(
          experiments.ActiveExperiments.allExperiments
            .find(_.name == feature)
            .map(test => opt(test.participationGroup.headerName, choice))
            .getOrElse(NotFound),
        ),
      )
    }
}
