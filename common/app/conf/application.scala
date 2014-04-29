package conf

import common.Assets.Assets
import common.GuardianConfiguration
import com.gu.management.play.RequestMetrics
import contentapi.{ElasticSearchContentApiClient, SolrContentApiClient}
import play.api.mvc.EssentialFilter
import play.filters.gzip.GzipFilter
import conf.Switches.GzipSwitch

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

// we are waiting for a few things to be ported over to V2 of content API
// 1. Search by reference
// 2. Factboxes
// 3. Performance of Related Content
// while that happens this needs to live, but you should not use it for anything new.
// use SwitchingContentApi instead for any new features
object ContentApiDoNotUseForNewQueries extends SolrContentApiClient()

object ElasticSearchContentApi extends ElasticSearchContentApiClient()

object SwitchingContentApi {
  def apply() = if (Switches.ElasticSearchSwitch.isSwitchedOn) ElasticSearchContentApi else ContentApiDoNotUseForNewQueries
}

object Static extends Assets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard

object Gzipper extends GzipFilter(shouldGzip = (req, resp) => GzipSwitch.isSwitchedOn)

object Filters {
  lazy val common: List[EssentialFilter] = Gzipper :: RequestMeasurementMetrics.asFilters
}
