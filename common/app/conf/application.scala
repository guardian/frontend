package conf

import common.Assets.Assets
import common.{ExecutionContexts, GuardianConfiguration}
import filters.RequestLoggingFilter
import contentapi.LiveContentApiClient
import implicits.Responses
import play.api.mvc._
import play.filters.gzip.GzipFilter

import scala.concurrent.Future

object Configuration extends GuardianConfiguration("frontend", webappConfDirectory = "env")

object LiveContentApi extends LiveContentApiClient

object Static extends Assets(Configuration.assets.path)
object StaticSecure extends Assets(Configuration.assets.path)

import Responses._
object Gzipper extends GzipFilter(shouldGzip = (_, resp) => !resp.isImage)

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

object Filters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val common: List[EssentialFilter] = List(
    JsonVaryHeadersFilter,
    Gzipper,
    BackendHeaderFilter,
    RequestLoggingFilter,
    GNUFilter
  )
}
