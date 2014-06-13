package conf

import common.Assets.Assets
import common.GuardianConfiguration
import com.gu.management.play.RequestMetrics
import contentapi.ElasticSearchLiveContentApiClient
import play.api.mvc.EssentialFilter
import play.filters.gzip.GzipFilter

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object LiveContentApi extends ElasticSearchLiveContentApiClient()

object Static extends Assets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard

object Gzipper extends GzipFilter(
  shouldGzip = (req, resp) => !resp.headers.get("Content-Type").exists(_.startsWith("image/"))
)

object Filters {
  lazy val common: List[EssentialFilter] = Gzipper :: RequestMeasurementMetrics.asFilters
}
