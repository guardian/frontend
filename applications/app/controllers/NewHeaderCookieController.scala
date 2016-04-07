package controllers

import model.Cached
import play.api.mvc.{Action, Controller, Cookie, DiscardingCookie}

import scala.concurrent.duration._

object NewHeaderCookieController extends Controller {
  private val NewHeaderOptIn = "new_header_opt_in"
  private val lifetime = 90.days.toSeconds.toInt

  def optIn() = Action { implicit request =>
    Cached(60)(SeeOther("/").withCookies(
      Cookie(NewHeaderOptIn, "true", maxAge = Some(lifetime))
    ))
  }

  def optOut() = Action { implicit request =>
    Cached(60)(SeeOther("/").discardingCookies(
      DiscardingCookie(NewHeaderOptIn)
    ))
  }
}
