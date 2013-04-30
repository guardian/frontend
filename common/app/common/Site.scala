package common

import play.api.mvc.RequestHeader

case class Site(
    ukHost: String,
    usHost: String,
    ukDesktopHost: String,
    usDesktopHost: String,
    ukAjaxHost: String,
    usAjaxHost: String,

    // use Edition(request) instead
    private[common] val edition: String = "UK") {

  lazy val isUsEdition = edition == "US"
  lazy val isUkEdition = !isUsEdition

  lazy val ajaxHost = if (isUsEdition) usAjaxHost else ukAjaxHost
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
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com",
      ukAjaxHost = "m.guardian.co.uk", usAjaxHost = "m.guardiannews.com"
    ),

    Site(ukHost = "m.gucode.co.uk", usHost = "m.gucode.com",
      ukDesktopHost = "www.gucode.co.uk", usDesktopHost = "www.gucode.com",
      ukAjaxHost = "m.gucode.co.uk", usAjaxHost = "m.gucode.com"
    ),

    Site(ukHost = "localhost:9000", usHost = "127.0.0.1:9000",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com",
      ukAjaxHost = "localhost:9000", usAjaxHost = "127.0.0.1:9000"
    ),

    // ---------------------------------------------------------------------------
    // Sites with the same desktop and mobile domain
    // The ajax host should not be the same as the standard host for these sites
    // ---------------------------------------------------------------------------
    Site(ukHost = "www.guardian.co.uk", usHost = "www.guardiannews.com",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "wwww.guardiannews.com",
      ukAjaxHost = "m.guardian.co.uk", usAjaxHost = "m.guardiannews.com"
    ),

    Site(ukHost = "www.gucode.co.uk", usHost = "www.gucode.com",
      ukDesktopHost = "www.gucode.co.uk", usDesktopHost = "www.gucode.com",
      ukAjaxHost = "m.gucode.co.uk", usAjaxHost = "m.gucode.com"
    ),

    Site(ukHost = "beta.guardian.co.uk", usHost = "beta.guardiannews.com",
      ukDesktopHost = "beta.guardian.co.uk", usDesktopHost = "beta.guardiannews.com",
      ukAjaxHost = "m.guardian.co.uk", usAjaxHost = "m.guardiannews.com"
    )
  ).flatMap(site => Seq(
      site.ukHost -> site.copy(edition = "UK"),
      site.usHost -> site.copy(edition = "US")
    )).toMap

  def apply(implicit request: RequestHeader): Site = {

    val editionOverride = request.getQueryString("_edition").map(AllowedEdition(_))

    val host = request.headers("host").toLowerCase

    val site = sites.get(host).getOrElse {
      // allows working through things like proxylocal during dev
      log.info(s"Using dynamic domain for site $host")
      Site(host, host, host, host, host, host, "UK")
    }

    editionOverride.map(edition => site.copy(edition = edition)).getOrElse(site)
  }
}

object AllowedEdition {
  private val allowed = Seq("UK", "US")

  // if edition is not in allowed list return the default
  def apply(ed: String) = allowed.find(_ == ed.toUpperCase).getOrElse("UK")
}

