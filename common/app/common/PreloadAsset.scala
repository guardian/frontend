package common

trait PreloadAsset {
  val asset: String
}

case class CssPreloadAsset(asset: String) extends PreloadAsset
case class JsPreloadAsset(asset: String) extends PreloadAsset
case class ThirdPartyJsPreload(asset: String) extends PreloadAsset
case class UrlPreload(asset: String) extends PreloadAsset
