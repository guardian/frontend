package common

import play.api.mvc.RequestHeader

case class Site(
    ukHost: String,
    usHost: String,
    ukDesktopHost: String,
    usDesktopHost: String,
    ukAjaxHost: String,
    usAjaxHost: String,
    edition: String = "UK") {

  lazy val isUsEdition = edition == "US"
  lazy val isUkEdition = !isUsEdition

  lazy val ajaxHost = if (isUsEdition) usAjaxHost else ukAjaxHost
  lazy val host = if (isUsEdition) usHost else ukHost
  lazy val desktopHost = if (isUsEdition) usDesktopHost else ukDesktopHost
}

object Site extends Logging {

  private val sites = Seq(

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

    // sites with the same desktop and mobile domain
    // ---------------------------------------------------------------------------
    Site(ukHost = "beta.guardian.co.uk", usHost = "beta.guardiannews.com",
      ukDesktopHost = "beta.guardian.co.uk", usDesktopHost = "beta.guardiannews.com",
      ukAjaxHost = "beta.guardian.co.uk", usAjaxHost = "beta.guardiannews.com"
    )
  )

  def apply(implicit request: RequestHeader): Site = {

    val host = request.headers("host").toLowerCase

    sites.find(site => site.ukHost == host || site.usHost == host)
      .map(site => if (site.usHost == host) site.copy(edition = "US") else site)
      .getOrElse {
        // allows working through things like proxylocal during dev
        log.info("Using dynamic domain for site " + host)
        Site(host, host, host, host, host, host, "UK")
      }
  }
}
