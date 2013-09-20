package common

import assets.AssetsPlugin
import play.api.Play
import play.api.mvc.RequestHeader

class StaticAssets(val base: String = "", val secureBase: String = "") extends Logging {

  val plugin: AssetsPlugin = Play.current.plugin[AssetsPlugin] getOrElse {
    log.error("Trying to use Static without including AssetPlugin. Is your play.plugins correct?")
    throw new RuntimeException("Missing AssetPlugin.")
  }

  val assetMappings: String => String = plugin.getAssetMappings(base, secureBase)

  def apply(path: String) = new StaticPath(assetMappings(path))
}

class StaticPath(path: String) {
  val asModulePath = path.replace(".js", "")
  lazy val md5Key = path.split('.').dropRight(1).last
  override def toString = path
}
