package controllers

import model.Cached
import play.api.mvc.{Action, Controller, Cookie, DiscardingCookie}

import scala.concurrent.duration._

object OptInController extends Controller {
  case class OptInFeature(cookieName: String, lifetime: Int = 90.days.toSeconds.toInt) {
    def opt(choice: String) = choice match {
      case "in" => optIn()
      case _ => optOut()
    }

    def optIn() = Cached(60)(SeeOther("/").withCookies(Cookie(cookieName, "true", maxAge = Some(lifetime))))
    def optOut() = Cached(60)(SeeOther("/").discardingCookies(DiscardingCookie(cookieName)))
  }

  def handle(feature: String, choice: String) = Action { implicit request =>
    feature match {
      case "https" => HTTPS.opt(choice)
      case "header" => Header.opt(choice)
      case _ => NotFound
    }
  }

  object HTTPS extends OptInFeature("https_opt_in")
  object Header extends OptInFeature("new_header_opt_in")
}
