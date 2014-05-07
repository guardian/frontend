package conf

import common.Assets.Assets
import common.GuardianConfiguration
import com.gu.management.play.RequestMetrics
import contentapi.ElasticSearchContentApiClient
import play.api.mvc.EssentialFilter
import play.filters.gzip.GzipFilter
import conf.Switches.GzipSwitch

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object ContentApi extends ElasticSearchContentApiClient()

object Static extends Assets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard

object Gzipper extends GzipFilter(shouldGzip = (req, resp) => GzipSwitch.isSwitchedOn)

object Filters {
  lazy val common: List[EssentialFilter] = Gzipper :: RequestMeasurementMetrics.asFilters
}
