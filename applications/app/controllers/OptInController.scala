package controllers

import model.Cached
import model.Cached.WithoutRevalidationResult
import play.api.mvc.{Action, Controller, Cookie, DiscardingCookie}

import scala.concurrent.duration._

object OptInController extends Controller {
  case class OptInFeature(cookieName: String, lifetime: Int = 90.days.toSeconds.toInt) {
    def opt(choice: String) = choice match {
      case "in" => optIn()
      case _ => optOut()
    }

    def optIn() = SeeOther("/").withCookies(Cookie(cookieName, "true", maxAge = Some(lifetime)))
    def optOut() = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
  }

  def handle(feature: String, choice: String) = Action { implicit request =>
    Cached(60)(WithoutRevalidationResult(feature match {
      case "https" => HTTPS.opt(choice)
      case "header" => Header.opt(choice)
      case "gallery" => gallery.opt(choice)
      case _ => NotFound
    }))
  }

  val HTTPS = OptInFeature("https_opt_in")
  val Header = OptInFeature("new_header_opt_in")
  val gallery = OptInFeature("gallery_redesign_opt_in")
}
