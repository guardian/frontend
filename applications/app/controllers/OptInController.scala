package controllers

import model.Cached
import model.Cached.WithoutRevalidationResult
import play.api.mvc.{Action, Controller, Cookie, DiscardingCookie}

import scala.concurrent.duration._

trait OptInOutFeature extends Controller {
  val cookieName: String
  val lifetime: Int
  def opt(choice: String) = choice match {
    case "in" => optIn()
    case _ => optOut()
  }
  def optIn() = SeeOther("/").withCookies(Cookie(cookieName, "true", maxAge = Some(lifetime)))
  def optOut() = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
}

case class OptInFeature(cookieName: String, lifetime: Int = 90.days.toSeconds.toInt) extends OptInOutFeature

class HttpsOptOutFeature extends OptInOutFeature {
  // replaces previous opt-in feature with opt-out (we're https by default now)
  val cookieName = "https_opt_out"
  val lifetime: Int = 365.days.toSeconds.toInt
  override def optIn() = SeeOther("/").discardingCookies(DiscardingCookie(cookieName),DiscardingCookie("https_opt_in"))
  override def optOut() = SeeOther("/").withCookies(Cookie(cookieName, "true", maxAge = Some(lifetime)))
}

object OptInController extends Controller {

  def handle(feature: String, choice: String) = Action { implicit request =>
    Cached(60)(WithoutRevalidationResult(feature match {
      case "https" => HTTPS.opt(choice)
      case "header" => Header.opt(choice)
      case "gallery" => gallery.opt(choice)
      case _ => NotFound
    }))
  }

  val HTTPS = new HttpsOptOutFeature
  val Header = OptInFeature("new_header_opt_in")
  val gallery = OptInFeature("gallery_redesign_opt_in")
}
