package conf

import common.{ StaticAssets, ContentApiClient, GuardianConfiguration }
import com.gu.management.play.RequestMetrics

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends ContentApiClient(Configuration)

object Static extends StaticAssets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard
