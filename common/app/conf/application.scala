package conf

import common.Assets.Assets
import common.{ExecutionContexts, GuardianConfiguration}
import contentapi.ElasticSearchLiveContentApiClient
import play.api.mvc._
import play.filters.gzip.GzipFilter
import Switches.ForceHttpResponseCodeSwitch

import scala.concurrent.Future

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object LiveContentApi extends ElasticSearchLiveContentApiClient

object Static extends Assets(Configuration.assets.path)

object Gzipper extends GzipFilter(
  shouldGzip = (req, resp) => !resp.headers.get("Content-Type").exists(_.startsWith("image/"))
)

object JsonVaryHeadersFilter extends Filter with ExecutionContexts with implicits.Requests {

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
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

object ForceHttpResponseFilter extends Filter with ExecutionContexts with Results {

  import scala.concurrent.Future.successful

  private val statuses = Map(
    "404" -> NotFound("Not found"),
    "500" -> InternalServerError("Internal server error"),
    "503" -> ServiceUnavailable("Service unavailable"),
    "504" -> GatewayTimeout("Gateway timeout")
  )

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (ForceHttpResponseCodeSwitch.isSwitchedOff) {
      nextFilter(request)
    } else {
      request.headers.get("X-Gu-Force-Status").flatMap(statuses.get).map(successful).getOrElse(
        nextFilter(request)
      )
    }
  }
}

// this lets the CDN log the exact part of the backend this response came from
object BackendHeaderFilter extends Filter with ExecutionContexts {

  private lazy val backendHeader = "X-Gu-Backend-App" -> Configuration.environment.projectName

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(backendHeader))
  }
}

object Filters {
                                     // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
                                     // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val common: List[EssentialFilter] =  ForceHttpResponseFilter :: JsonVaryHeadersFilter :: Gzipper :: BackendHeaderFilter :: Nil
}
