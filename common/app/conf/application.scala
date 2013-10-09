package conf

import assets.Assets
import common.GuardianConfiguration
import com.gu.management.play.RequestMetrics
import contentapi.{ ElasticSearchContentApiClient, SolrContentApiClient }

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends SolrContentApiClient()

object ElasticSearchContentApi extends ElasticSearchContentApiClient()

object SwitchingContentApi {
  def apply() = if (Switches.ElasticSearchSwitch.isSwitchedOn) ElasticSearchContentApi else ContentApi
}

object Static extends Assets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard
