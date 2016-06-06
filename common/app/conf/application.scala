package conf

object Configuration extends common.GuardianConfiguration("frontend", webappConfDirectory = "env")
object Static extends common.Assets.Assets(Configuration.assets.path, "assets/assets.map")
object Css extends common.Assets.CssMap("assets/atomic-class-map.json")
