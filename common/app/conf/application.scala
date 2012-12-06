package conf

import common.{ StaticAssets, ContentApiClient, GuardianConfiguration }

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends ContentApiClient(Configuration)

object Static extends StaticAssets(Configuration.static.path)
