package controllers

import common.{ ExecutionContexts, Logging }
import model.NoCache
import play.api.mvc.{ SimpleResult, Cookie, Action, Controller }

object ChangeViewController extends Controller with Logging with ExecutionContexts {

  private def switchTo(platform: String, url: String): SimpleResult = Found(url)
    .withCookies(Cookie("GU_VIEW", platform, maxAge = Some(60)))
    .withHeaders("Cache-Control" -> "max-age=0")

  def render(platform: String, redirectUrl: String) = Action {
    platform match {
      case "mobile" | "desktop" => NoCache(switchTo(platform, redirectUrl))
      case _ => NotFound("unknown platform")
    }
  }
}
