package conf

object Configuration extends common.GuardianConfiguration("frontend", webappConfDirectory = "env")
object Static extends common.Assets.Assets(Configuration.assets.path)
