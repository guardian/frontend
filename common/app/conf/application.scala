package conf

import common.{ StaticAssets, GuardianConfiguration }
import com.gu.management.play.RequestMetrics
import contentapi.{ElasticContentApiClient, SolrContentApiClient}

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends SolrContentApiClient()

object ElasticContentApi extends ElasticContentApiClient()

object SwitchingContentApi {
  def apply() = if (Switches.ElasticSearchSwitch.isSwitchedOn) ElasticContentApi else ContentApi
}

object Static extends StaticAssets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard
