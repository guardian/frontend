package controllers

import common.LinkTo
import conf.Configuration.site
import model.NoCache
import play.api.mvc.{Cookie, RequestHeader, Result, Results}

trait PreferenceController extends Results {

  // we do not want people redirecting to arbitrary domains
  def allowedUrl(url: String)(implicit request: RequestHeader) = site.host match {
    case "" => url.startsWith("/") && !url.startsWith("//")
    case host => LinkTo(url) startsWith host
  }

  protected def getShortenedDomain(domain: String) = {
    val regex = "^(www|dev)\\.".r
    val shortDomain = regex.replaceFirstIn(domain, ".")

    if (shortDomain == domain) {
      None
    } else {
      Some(shortDomain)
    }
  }

  def switchTo(cookie: (String, String), url: String)(implicit request: RequestHeader): Result = switchTo(Seq(cookie), url)

  def switchTo(cookies: Seq[(String, String)], url: String)(implicit request: RequestHeader): Result = if (allowedUrl(url)){
    NoCache(
      Found(url)
      .withCookies(cookies.map{ case (name, value) =>
        // Expire after one year or if value is empty
        val oneYearInSeconds = 31536000
        Cookie( name,
                value,
                maxAge = if (value.nonEmpty) { Some(oneYearInSeconds) } else { Some(-1) },
                domain = getShortenedDomain(request.domain),
                httpOnly = false)
      }.toSeq:_*)
    )
  } else Forbidden("will not redirect there")
}
