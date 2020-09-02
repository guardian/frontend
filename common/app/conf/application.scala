package conf

object Configuration extends common.GuardianConfiguration
object Static extends common.Assets.Assets(Configuration.assets.path, "assets/assets.map")
object DiscussionAsset {
  def apply(assetName: String): String = {
    assets.DiscussionAssetsMap.getURL(assetName)
  }
}
