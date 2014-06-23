package conf

import common.Assets.Assets
import common.{ExecutionContexts, GuardianConfiguration}
import com.gu.management.play.RequestMetrics
import contentapi.ElasticSearchLiveContentApiClient
import play.api.mvc._
import play.filters.gzip.GzipFilter
import scala.concurrent.Future

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object LiveContentApi extends ElasticSearchLiveContentApiClient()

object Static extends Assets(Configuration.assets.path)

object RequestMeasurementMetrics extends RequestMetrics.Standard

object Gzipper extends GzipFilter(
  shouldGzip = (req, resp) => !resp.headers.get("Content-Type").exists(_.startsWith("image/"))
)

object  JsonVaryHeadersFilter extends Filter with ExecutionContexts with implicits.Requests {

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def apply(nextFilter: (RequestHeader) => Future[SimpleResult])(request: RequestHeader): Future[SimpleResult] = {
    nextFilter(request).map{ result =>
      if (request.isJson) {
        import result.header.headers
        // Accept-Encoding Vary field will be set by Gzipper
        val vary = headers.get("Vary").fold(defaultVaryFields)(v => (v :: varyFields).mkString(","))
        result.withHeaders("Vary" -> vary)
      } else {
        result
      }
    }
  }
}

object Filters {
                                     // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
                                     // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val common: List[EssentialFilter] =  JsonVaryHeadersFilter :: Gzipper :: RequestMeasurementMetrics.asFilters
}
