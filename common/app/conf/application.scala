package conf

import common.Assets.Assets
import common.GuardianConfiguration
import com.gu.management.play.RequestMetrics
import contentapi.{FaciaElasticSearchContentApiClient, FaciaSolrContentApiClient, ElasticSearchContentApiClient, SolrContentApiClient}

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends SolrContentApiClient()
object ElasticSearchContentApi extends ElasticSearchContentApiClient()

object FaciaContentApi extends FaciaSolrContentApiClient()
object FaciaElasticSearchContentApi extends FaciaElasticSearchContentApiClient()

object SwitchingContentApi {
  def apply() = if (Switches.ElasticSearchSwitch.isSwitchedOn) ElasticSearchContentApi else ContentApi
  def facia() = if (Switches.ElasticSearchSwitch.isSwitchedOn) FaciaElasticSearchContentApi else FaciaContentApi
}

object Static extends Assets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard
