package common

import play.api.mvc.RequestHeader
import play.api.templates.Html

case class Site(
    ukHost: String,
    usHost: String,
    ukDesktopHost: String,
    usDesktopHost: String,

    // use Edition(request) instead
    private[common] val edition: String = "UK") {

  lazy val isUsEdition = edition == "US"
  lazy val isUkEdition = !isUsEdition

  lazy val host = if (isUsEdition) usHost else ukHost
  lazy val desktopHost = if (isUsEdition) usDesktopHost else ukDesktopHost

  // both mobile and desktop are on same host
  lazy val isSingleDomain = ukDesktopHost == ukHost && usDesktopHost == usHost

}

object Site extends Logging {

  private lazy val sites = Seq(

    // ---------------------------------------------------------------------------
    // Sites with different desktop and mobile domains
    // ---------------------------------------------------------------------------
    Site(ukHost = "m.guardian.co.uk", usHost = "m.guardiannews.com",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com"
    ),

    Site(ukHost = "m.gucode.co.uk", usHost = "m.gucode.com",
      ukDesktopHost = "www.gucode.co.uk", usDesktopHost = "www.gucode.com"
    )

  // comment me out to test locally as a single domain site
    ,Site(ukHost = "localhost:9000", usHost = "127.0.0.1:9000",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com"
    )

  ).flatMap(site => Seq(
      site.ukHost -> site.copy(edition = "UK"),
      site.usHost -> site.copy(edition = "US")
    )).toMap

  def apply(implicit request: RequestHeader): Option[Site] = {
    val host = request.headers("host").toLowerCase
    sites.get(host)
  }
}

object Host {
  def apply(request: RequestHeader) = request.host
}

// TODO - temporary object while we switch between multi and single domains
object SiteOr {
  def apply(htmlForSite: Site => Html)( htmlWithoutSite: => Html)(implicit request: RequestHeader) = Site(request).map{ site =>
    htmlForSite(site)
  }.getOrElse(htmlWithoutSite)
}
