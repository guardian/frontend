package controllers

import common.{LinkTo, ExecutionContexts, Logging}
import model.NoCache
import play.api.mvc._
import conf.Configuration.site
import play.api.mvc.Cookie

object ChangeViewController extends Controller with Logging with ExecutionContexts {

  private def switchTo(platform: String, url: String) = Found(url)
    .withCookies(Cookie("GU_VIEW", platform, maxAge = Some(5184000))) // 60 days, this is seconds
    .withHeaders("Cache-Control" -> "max-age=0")

  // we do not want people redirecting to arbitrary domains
  private def allowedUrl(url: String)(implicit request: RequestHeader) = site.host match {
    case "" => url.startsWith("/") && !url.startsWith("//")
    case host => LinkTo(url) startsWith host
  }

  def render(platform: String, redirectUrl: String) = Action { implicit request =>
   if (allowedUrl(redirectUrl))
     platform match {
      case "mobile" | "desktop" => NoCache(switchTo(platform, redirectUrl))
      case _ => NotFound("unknown platform")
    }
   else
     Forbidden("will not redirect there")
  }
}