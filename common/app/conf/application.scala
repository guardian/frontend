package conf

object Configuration extends common.GuardianConfiguration("frontend", webappConfDirectory = "env")
object LiveContentApi extends contentapi.LiveContentApiClient
object Static extends common.Assets.Assets(Configuration.assets.path)
object StaticJspm extends common.Assets.Assets(Configuration.assets.path, "assets/jspm-assets.map")
