package conf

import common.{ StaticAssets, GuardianConfiguration }
import com.gu.management.play.RequestMetrics
import contentapi.{ElasticSearchContentApiClient, SolrContentApiClient}

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends SolrContentApiClient()

object ElasticSearchContentApi extends ElasticSearchContentApiClient()

object SwitchingContentApi {
  def apply() = if (Switches.ElasticSearchSwitch.isSwitchedOn) ElasticSearchContentApi else ContentApi
}

object Static extends StaticAssets(Configuration.assets.path, Configuration.assets.securePath)

object RequestMeasurementMetrics extends RequestMetrics.Standard
