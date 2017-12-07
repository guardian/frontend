package http

import javax.inject.Inject

import akka.stream.Materializer
import cache.SurrogateKey
import implicits.Responses._
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.mvc._
import play.filters.gzip.{GzipFilter, GzipFilterConfig}
import experiments.LookedAtExperiments

import scala.concurrent.{ExecutionContext, Future}

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

class JsonVaryHeadersFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter with implicits.Requests {

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
class BackendHeaderFilter(implicit val mat: Materializer, context: ApplicationContext, executionContext: ExecutionContext) extends Filter {

  private lazy val backendHeader = "X-Gu-Backend-App" -> context.applicationIdentity.name

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(backendHeader))
  }
}

// See https://www.fastly.com/blog/surrogate-keys-part-1/
class SurrogateKeyFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {

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

class ExperimentsFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    val r = LookedAtExperiments.createRequest(request)
    nextFilter(r).map { rh =>
      val experimentHeaders = experimentsResponseHeaders(r)
      val varyHeaderValues = rh.header.headers.get("Vary").toSeq ++ experimentHeaders.get("Vary").toSeq
      val responseHeaders = (experimentHeaders + ("Vary" -> varyHeaderValues.mkString(",")))
        .filterNot { case (_, v) => v.isEmpty }
        .toSeq
      rh.withHeaders(responseHeaders:_*)
    }
  }

  /* Creating experiments related response headers
   * Ex:
   *  Vary: "experiment-header-1, experiment-header-2"
   *  X-GU-Depends-On-Experiments: "experiment-1-name, experiment-2-name"
   */
  private def experimentsResponseHeaders(request: RequestHeader): Map[String, String] =
    LookedAtExperiments
      .forRequest(request)
      .flatMap { experiment =>
        val experimentVaryHeaders = Seq(experiment.participationGroup.headerName) ++ experiment.extraHeader.map(_.key)
        Seq(("Vary" -> experimentVaryHeaders.mkString(",")), ("X-GU-Depends-On-Experiments" -> experiment.name))
      }
      .groupBy(_._1).map { case (k,v) => k -> v.map(_._2).mkString(",") }
}


object Filters {
  // NOTE - order is important here, Gzipper AFTER JsonVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  def common(
    implicit materializer: Materializer,
    applicationContext: ApplicationContext,
    executionContext: ExecutionContext
  ): List[EssentialFilter] = List(
    new RequestLoggingFilter,
    new JsonVaryHeadersFilter,
    new ExperimentsFilter,
    new Gzipper,
    new BackendHeaderFilter,
    new SurrogateKeyFilter,
    new AmpFilter,
    new H2PreloadFilter
  )
}

class CommonFilters(
  implicit mat: Materializer,
  applicationContext: ApplicationContext,
  executionContext: ExecutionContext
) extends HttpFilters {
  val filters = Filters.common
}

class CommonGzipFilter @Inject() (
  implicit mat: Materializer
) extends HttpFilters {

  val filters = Seq(new Gzipper)
}
