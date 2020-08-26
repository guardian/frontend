package http

import common.{CssPreloadAsset, JsPreloadAsset, PreloadAsset, ThirdPartyJsPreload, UrlPreload}
import model.ApplicationContext
import play.api.mvc.{RequestHeader, Result}

trait ResultWithPreload {
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
  }
}
