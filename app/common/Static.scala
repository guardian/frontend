package common

import assets.AssetsPlugin
import play.api.Play

class Static(val base: String = "") extends Logging {
  private val staticMappings: Map[String, String] = {
    val plugin = Play.current.plugin[AssetsPlugin]
    if (!plugin.isDefined) {
      log.error("Trying to use Static without including AssetPlugin. Is your play.plugins correct?")
      throw new RuntimeException("Missing AssetPlugin.")
    }

    plugin.get assetMappings base
  }

  def apply(path: String) = staticMappings(path)
}