package controllers

import play.api.mvc.{SimpleResult, Results, Cookie, RequestHeader}
import common.LinkTo
import conf.Configuration.site
import model.NoCache

trait PreferenceController extends Results {

  // we do not want people redirecting to arbitrary domains
  def allowedUrl(url: String)(implicit request: RequestHeader) = site.host match {
    case "" => url.startsWith("/") && !url.startsWith("//")
    case host => LinkTo(url) startsWith host
  }

  def switchTo(cookie: (String, String), url: String)(implicit request: RequestHeader): SimpleResult = switchTo(Seq(cookie), url)

  def switchTo(cookies: Seq[(String, String)], url: String)(implicit request: RequestHeader): SimpleResult = if (allowedUrl(url)){
    NoCache(Found(url)
      .withCookies(cookies.map{ case (name, value) =>
        // 60 days expiration, or expire if value is empty
        Cookie(name, value, maxAge = if (value.nonEmpty) { Some(5184000) } else { Some(-1) })
      }.toSeq:_*)
    )
  } else Forbidden("will not redirect there")
}
