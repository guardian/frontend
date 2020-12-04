package http

import common.{CssPreloadAsset, JsPreloadAsset, PreloadAsset, ThirdPartyJsPreload, UrlPreload}
import model.ApplicationContext
import play.api.mvc.{RequestHeader, Result}

trait ResultWithPreconnectPreload {
  final implicit class RichResult(self: Result) {

    val linkHeaderKey = "Link"

    def withPreload(assets: Seq[PreloadAsset])(implicit context: ApplicationContext, request: RequestHeader): Result = {
      if (assets.nonEmpty) {
        val preloadFiles = assets
          .map {
            case jsFile: JsPreloadAsset =>
              s"<${conf.Static(jsFile.asset)}>; rel=preload; as=script; nopush"
            case cssFile: CssPreloadAsset =>
              s"<${conf.Static(common.Assets.css.projectCss(Some(cssFile.asset.stripSuffix(".css"))))}>; rel=preload; as=style; nopush"
            case thirdPartyJsFile: ThirdPartyJsPreload =>
              s"<${thirdPartyJsFile.asset}>; rel=preload; as=script; nopush"
            case url: UrlPreload =>
              s"<${url.asset}>; rel=preload; nopush"
          }
          .mkString(",")
        val linkHeaderValue = self.header.headers.get(linkHeaderKey).map(_ ++ s",$preloadFiles") getOrElse preloadFiles
        self.withHeaders(linkHeaderKey -> linkHeaderValue)
      } else self
    }

    def withPreconnect(urls: Seq[String]): Result = {
      // Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link
      // Reference: https://www.w3.org/TR/resource-hints/
      /*
        Note that the two above references disagree on the exact grammar. The first indicates
        Link: <https://example.com>; rel="preconnect"

        while the second indicates:
        Link: <https://example.com>; rel=preconnect

        The difference being the presence of quotes around "preconnect".

        Let's adopt the second version to be consistent with the choice made in def withPreload
       */
      if (urls.nonEmpty) {
        val preconnections = urls
          .map(url => s"<${url}>; rel=preconnect")
          .mkString(",")
        val linkHeaderValue =
          self.header.headers.get(linkHeaderKey).map(_ ++ s",$preconnections") getOrElse preconnections
        self.withHeaders(linkHeaderKey -> linkHeaderValue)
      } else self
    }

  }
}

object HttpPreconnections {
  val defaultUrls = Seq(
    "https://assets.guim.co.uk/",
    "https://i.guim.co.uk",
    "https://j.ophan.co.uk",
    "https://ophan.theguardian.com",
    "https://api.nextgen.guardianapps.co.uk",
    "https://hits-secure.theguardian.com",
    "https://interactive.guim.co.uk",
    "https://ipv6.guim.co.uk",
    "https://phar.gu-web.net",
    "https://static.theguardian.com",
    "https://support.theguardian.com",
  )
}
