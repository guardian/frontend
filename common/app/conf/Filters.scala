package conf

import javax.inject.Inject

import akka.stream.Materializer
import akka.agent.Agent
import cache.SurrogateKey
import common.ExecutionContexts
import filters.RequestLoggingFilter
import play.api.http.HttpFilters
import implicits.Responses._
import play.api.mvc.{EssentialFilter, Filter, RequestHeader, Result}
import play.filters.gzip.GzipFilter

import scala.concurrent.Future

class Gzipper(implicit val mat: Materializer) extends GzipFilter(shouldGzip = (_, result) => !result.header.isImage)

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
class BackendHeaderFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts {

  private lazy val backendHeader = "X-Gu-Backend-App" -> conf.Configuration.environment.projectName

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

class AmpFilter(implicit val mat: Materializer) extends Filter with ExecutionContexts with implicits.Requests {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (request.isAmp) {
      val domain = request.headers.get("Origin").getOrElse("https://" + request.domain)
      val exposeAmpHeader = "Access-Control-Expose-Headers" -> "AMP-Access-Control-Allow-Source-Origin"
      val ampHeader = "AMP-Access-Control-Allow-Source-Origin" -> Configuration.amp.baseUrl

      nextFilter(request).map(_.withHeaders(exposeAmpHeader, ampHeader))
    } else {
      nextFilter(request)
    }
  }
}

object Filters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  def common(implicit materializer: Materializer): List[EssentialFilter] = List(
    new PanicSheddingFilter,
    new JsonVaryHeadersFilter,
    new Gzipper,
    new BackendHeaderFilter,
    new SurrogateKeyFilter,
    new AmpFilter
  )
}

class CommonFilters @Inject() (
  implicit mat: Materializer
) extends HttpFilters {

  val filters = Filters.common
}

class CommonGzipFilter @Inject() (
  implicit mat: Materializer
) extends HttpFilters {

  val filters = Seq(new Gzipper)
}
