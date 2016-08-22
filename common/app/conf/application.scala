package conf

object Configuration extends common.GuardianConfiguration
object Static extends common.Assets.Assets(Configuration.assets.path, "assets/assets.map")
object Atomise extends common.Assets.CssMap("assets/atomic-class-map.json")
object DiscussionAsset {
  def apply(assetName: String):String = {
    assets.DiscussionAssetsMap.getURL(assetName)
  }
}
