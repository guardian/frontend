package controllers

import model.Cached
import model.Cached.WithoutRevalidationResult
import play.api.mvc._

import scala.concurrent.duration._

trait OptFeature extends BaseController {
  val cookieName: String
  val lifetime: Int = 90.days.toSeconds.toInt
  def opt(choice: String): Result = choice match {
    case "in" => optIn()
    case "out" => optOut()
    case _ => optDelete()
  }
  def optIn(): Result = SeeOther("/").withCookies(Cookie(cookieName, "true", maxAge = Some(lifetime)))
  def optOut(): Result = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
  def optDelete(): Result = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
}

case class HttpsOptFeature(cookieName: String, val controllerComponents: ControllerComponents) extends OptFeature {
  override def optOut(): Result = SeeOther("/").withCookies(Cookie(cookieName, "false", maxAge = Some(lifetime)))
}

case class OptInFeature(cookieName: String, val controllerComponents: ControllerComponents) extends OptFeature

class OptInController(val controllerComponents: ControllerComponents) extends BaseController {

  def handle(feature: String, choice: String): Action[AnyContent] = Action { implicit request =>
    Cached(60)(WithoutRevalidationResult(feature match {
      case "desktopheader" => newDesktopHeader.opt(choice)
      case _ => NotFound
    }))
  }

  //cookies should correspond with those checked by fastly-edge-cache
  val newDesktopHeader = OptInFeature("new_desktop_header", controllerComponents)
}
