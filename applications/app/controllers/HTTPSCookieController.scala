package controllers

import model.Cached
import play.api.mvc.{DiscardingCookie, Cookie, Action, Controller}
import scala.concurrent.duration._

object HTTPSCookieController extends Controller {
  private val HTTPSOptIn = "https_opt_in"
  private val lifetime = 90.days.toSeconds.toInt

  def optIn() = Action { implicit request =>
    Cached(60)(SeeOther("/").withCookies(
      Cookie(HTTPSOptIn, "true", maxAge = Some(lifetime))
    ))
  }

  def optOut() = Action { implicit request =>
    Cached(60)(SeeOther("/").discardingCookies(
      DiscardingCookie(HTTPSOptIn)
    ))
  }
}
