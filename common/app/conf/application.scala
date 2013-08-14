package conf

import common.{ StaticAssets, GuardianConfiguration }
import com.gu.management.play.RequestMetrics
import contentapi.{FaciaContentApi, ContentApiClient}

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends ContentApiClient(Configuration)

object FaciaContentApi extends FaciaContentApi(Configuration)

object Static extends StaticAssets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard
