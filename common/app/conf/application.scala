package conf

import common.Assets.Assets
import common.GuardianConfiguration
import com.gu.management.play.RequestMetrics
import contentapi.{ElasticSearchContentApiClient, SolrContentApiClient}

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends SolrContentApiClient()
object ElasticSearchContentApi extends ElasticSearchContentApiClient()

object FaciaContentApi extends SolrContentApiClient() {
  override def fetch(url: String, parameters: Map[String, String]) = {
    super.fetch(url, parameters + ("application-name" -> "facia"))
  }
}
object FaciaElasticSearchContentApi extends ElasticSearchContentApiClient() {
  override def fetch(url: String, parameters: Map[String, String]) = {
    super.fetch(url, parameters + ("application-name" -> "facia"))
  }
}

object SwitchingContentApi {
  def apply() = if (Switches.ElasticSearchSwitch.isSwitchedOn) ElasticSearchContentApi else ContentApi
  def facia() = if (Switches.ElasticSearchSwitch.isSwitchedOn) FaciaElasticSearchContentApi else FaciaContentApi
}

object Static extends Assets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard
