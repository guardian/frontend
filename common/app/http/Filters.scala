package http

import javax.inject.Inject

import akka.stream.Materializer
import cache.SurrogateKey
import common.ExecutionContexts
import implicits.Responses._
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.mvc._
import play.filters.gzip.{GzipFilterConfig, GzipFilter}

import scala.concurrent.Future

class GzipperConfig() extends GzipFilterConfig {
  // These paths are used as a whitelist that means the server's
  // outgoing response for this request will be uncompressed.
  val excludeFromGzip = List(
    "/esi/ad-call"
  )

  override val shouldGzip: (RequestHeader, Result) => Boolean = (request, result) => {
    !result.header.isImage && !excludeFromGzip.contains(request.path)
  }
}
class Gzipper(implicit val mat: Materializer) extends GzipFilter(new GzipperConfig)

class JsonVaryHeadersFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts with implicits.Requests {

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

// this lets the CDN log the exact part of the backend this response came from
class BackendHeaderFilter(implicit val mat: Materializer, context: ApplicationContext) extends Filter with ExecutionContexts {

  private lazy val backendHeader = "X-Gu-Backend-App" -> context.applicationIdentity.name

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(backendHeader))
  }
}

// See https://www.fastly.com/blog/surrogate-keys-part-1/
class SurrogateKeyFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts {

  private val SurrogateKeyHeader = "Surrogate-Key"

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    val surrogateKey = SurrogateKey(request)
    nextFilter(request).map{ result =>
      // Surrogate keys are space delimited, so string them together if there are already some present
      val key = result.header.headers.get(SurrogateKeyHeader).map(key => s"$key $surrogateKey").getOrElse(surrogateKey)
      result.withHeaders(SurrogateKeyHeader -> key)
    }
  }
}



object Filters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  def common(implicit materializer: Materializer, context: ApplicationContext): List[EssentialFilter] = List(
    new RequestLoggingFilter,
    new JsonVaryHeadersFilter,
    new Gzipper,
    new BackendHeaderFilter,
    new SurrogateKeyFilter,
    new AmpFilter
  )
}

class CommonFilters(implicit mat: Materializer, context: ApplicationContext) extends HttpFilters {
  val filters = Filters.common
}

class CommonGzipFilter @Inject() (
  implicit mat: Materializer
) extends HttpFilters {

  val filters = Seq(new Gzipper)
}
