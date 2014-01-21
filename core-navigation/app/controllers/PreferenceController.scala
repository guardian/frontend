package controllers

import play.api.mvc.{Results, Cookie, RequestHeader}
import common.LinkTo
import conf.Configuration.site
import model.NoCache

trait PreferenceController extends Results {

  // we do not want people redirecting to arbitrary domains
  def allowedUrl(url: String)(implicit request: RequestHeader) = site.host match {
    case "" => url.startsWith("/") && !url.startsWith("//")
    case host => LinkTo(url) startsWith host
  }

  def switchTo(cookie: (String, String), url: String)(implicit request: RequestHeader) = if (allowedUrl(url)){
    NoCache(Found(url)
      .withCookies(Cookie(cookie._1, cookie._2, maxAge = Some(5184000))) // 60 days, this is seconds
    )
  } else Forbidden("will not redirect there")
}
