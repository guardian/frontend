package controllers

import model.Cached
import model.Cached.WithoutRevalidationResult
import play.api.mvc.{Action, Controller, Cookie, DiscardingCookie}

import scala.concurrent.duration._

trait OptFeature extends Controller {
  val cookieName: String
  val lifetime: Int = 90.days.toSeconds.toInt
  def opt(choice: String) = choice match {
    case "in" => optIn()
    case "out" => optOut()
    case _ => optDelete()
  }
  def optIn() = SeeOther("/").withCookies(Cookie(cookieName, "true", maxAge = Some(lifetime)))
  def optOut() = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
  def optDelete() = SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
}

case class HttpsOptFeature(cookieName: String) extends OptFeature {
  override def optOut() = SeeOther("/").withCookies(Cookie(cookieName, "false", maxAge = Some(lifetime)))
}

case class OptInFeature(cookieName: String) extends OptFeature

class OptInController extends Controller {

  def handle(feature: String, choice: String) = Action { implicit request =>
    Cached(60)(WithoutRevalidationResult(feature match {
      case "navigationmoretoggle" => navigationMoreToggle.opt(choice)
      case "newrecipedesign" => newRecipeDesignOverride.opt(choice)
      case _ => NotFound
    }))
  }
//cookies should correspond with those checked by fastly-edge-cache
  val navigationMoreToggle = OptInFeature("ab_navigation_more_toggle")
  val newRecipeDesignOverride = OptInFeature("new_recipe_design_opt_in")
}
