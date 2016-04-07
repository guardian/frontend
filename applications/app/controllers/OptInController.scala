package controllers

import model.Cached
import play.api.mvc.{DiscardingCookie, Cookie, Action, Controller}
import scala.concurrent.duration._

object OptInController extends Controller {
  trait OptInFeature {
    val CookieName: String
    val lifetime: Int = 90.days.toSeconds.toInt

    def optIn() = Action { implicit request =>
      Cached(60)(SeeOther("/").withCookies(
        Cookie(CookieName, "true", maxAge = Some(lifetime))
      ))
    }

    def optOut(cookie: String) = Action { implicit request =>
      Cached(60)(SeeOther("/").discardingCookies(
        DiscardingCookie(cookie)
      ))
    }
  }

  object HTTPS extends OptInFeature {
    val CookieName = "https_opt_in"
  }

  object Header extends OptInFeature {
    val CookieName = "new_header_opt_in"
  }
}
