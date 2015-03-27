package conf

import common.Assets.Assets
import common.{ExecutionContexts, GuardianConfiguration}
import filters.RequestLoggingFilter
import contentapi.{ElasticSearchPreviewContentApiClient, ElasticSearchLiveContentApiClient}
import model.{Page, Cached}
import play.api.mvc._
import play.filters.gzip.GzipFilter
import Switches.CareersMaintenanceSwitch

import scala.concurrent.Future

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object LiveContentApi extends ElasticSearchLiveContentApiClient

object PreviewContentApi extends ElasticSearchPreviewContentApiClient

object Static extends Assets(Configuration.assets.path)
object StaticSecure extends Assets(Configuration.assets.securePath)

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

object GNUFilter extends Filter with ExecutionContexts {

  //http://www.theguardian.com/books/shortcuts/2015/mar/17/terry-pratchetts-name-lives-on-in-the-clacks-with-hidden-web-code
  private val GNUHeader = "X-Clacks-Overhead" -> "GNU Terry Pratchett"

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(GNUHeader))
  }
}

// this lets the CDN log the exact part of the backend this response came from
object BackendHeaderFilter extends Filter with ExecutionContexts {

  private lazy val backendHeader = "X-Gu-Backend-App" -> Configuration.environment.projectName

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(backendHeader))
  }
}

object CareersFilter extends Filter with ExecutionContexts with Results {

  private val page = new Page("careers/maintenance", "careers", "Guardian Careers - under maintenance", "GFE:careers:maintenance")

  // we want to be able to build the front and check things on preview
  private lazy val notPreview = !Configuration.environment.isPreview

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (CareersMaintenanceSwitch.isSwitchedOn && request.path.startsWith("/careers") && notPreview) {
      Future.successful(Cached(5)(Ok(views.html.careersMaintenance(page)(request))))
    } else {
      nextFilter(request)
    }
  }
}

object Filters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val common: List[EssentialFilter] = List(
    JsonVaryHeadersFilter,
    Gzipper,
    BackendHeaderFilter,
    RequestLoggingFilter,
    GNUFilter,
    CareersFilter
  )
}
