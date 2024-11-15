package conf

object Configuration extends common.GuardianConfiguration
object Static extends common.Assets.Assets(Configuration.assets.path, "assets/assets.map")
