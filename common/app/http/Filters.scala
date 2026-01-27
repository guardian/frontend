package http

import javax.inject.Inject
import org.apache.pekko.stream.Materializer
import app.FrontendBuildInfo
import conf.switches.Switches
import implicits.Responses._
import model.{ApplicationContext, Cached}
import play.api.http.HttpFilters
import play.api.mvc._
import play.filters.gzip.{GzipFilter, GzipFilterConfig}
import experiments.LookedAtExperiments
import model.Cached.PanicReuseExistingResult
import org.apache.commons.codec.digest.DigestUtils
import ab.ABTests
import conf.switches.Switches.{EnableNewServerSideABTestsHeader}

import scala.concurrent.{ExecutionContext, Future}
import experiments.Experiment
import experiments.{ActiveExperiments}

class GzipperConfig() extends GzipFilterConfig {
  override val shouldGzip: (RequestHeader, Result) => Boolean = (request, result) => {
    !result.header.isImage
  }
}
class Gzipper(implicit val mat: Materializer) extends GzipFilter(new GzipperConfig)

class JsonVaryHeadersFilter(implicit val mat: Materializer, executionContext: ExecutionContext)
    extends Filter
    with implicits.Requests {

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map { result =>
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
class BackendHeaderFilter(frontendBuildInfo: FrontendBuildInfo)(implicit
    val mat: Materializer,
    context: ApplicationContext,
    executionContext: ExecutionContext,
) extends Filter {

  private lazy val backendHeader = "X-Gu-Backend-App" -> context.applicationIdentity.name
  private lazy val gitCommitHeader = "X-Gu-Frontend-Git-Commit-Id" -> frontendBuildInfo.gitCommitId

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(backendHeader, gitCommitHeader))
  }
}

// See https://www.fastly.com/blog/surrogate-keys-part-1/
class SurrogateKeyFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {

  private val SurrogateKeyHeader = "Surrogate-Key"

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    val surrogateKey = DigestUtils.md5Hex(request.path)
    nextFilter(request).map { result =>
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
      val responseHeaders = (experimentHeaders + ("Vary" -> varyHeaderValues.mkString(","))).filterNot { case (_, v) =>
        v.isEmpty
      }.toSeq
      rh.withHeaders(responseHeaders: _*)
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
      .groupBy(_._1)
      .map { case (k, v) => k -> v.map(_._2).mkString(",") }
}

/** AB Testing filter that add the server side ab tests header to the Vary header and sets up AB tests from the request
  * header.
  */
class ABTestingFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {
  private val abTestHeader = "X-GU-Server-AB-Tests"

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (EnableNewServerSideABTestsHeader.isSwitchedOff) {
      nextFilter(request)
    } else {
      val r = ABTests.decorateRequest(request, abTestHeader)
      nextFilter(r).map { result =>
        val varyHeaderValues = result.header.headers.get("Vary").toSeq ++ Seq(abTestHeader)
        val abTestHeaderValue = request.headers.get(abTestHeader).getOrElse("")
        val responseHeaders =
          Map(abTestHeader -> abTestHeaderValue, "Vary" -> varyHeaderValues.mkString(",")).filterNot { case (_, v) =>
            v.isEmpty
          }.toSeq

        result.withHeaders(responseHeaders: _*)

      }
    }
  }
}

class PanicSheddingFilter(implicit val mat: Materializer, executionContext: ExecutionContext) extends Filter {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (Switches.PanicShedding.isSwitchedOn && request.headers.hasHeader("If-None-Match")) {
      Future.successful(Cached(900)(PanicReuseExistingResult(Results.NotModified))(request))
    } else {
      nextFilter(request)
    }
  }
}

object Filters {
  // NOTE: filters are executed in *reverse* order, and the order is important.
  def common(frontendBuildInfo: FrontendBuildInfo)(implicit
      materializer: Materializer,
      applicationContext: ApplicationContext,
      executionContext: ExecutionContext,
  ): List[EssentialFilter] =
    List(
      new RequestLoggingFilter,
      new PanicSheddingFilter,
      new JsonVaryHeadersFilter,
      new ABTestingFilter,
      new ExperimentsFilter,
      new Gzipper,
      new BackendHeaderFilter(frontendBuildInfo),
      new SurrogateKeyFilter,
      new AmpFilter,
      new TooManyHeadersFilter,
    )

  def preload(implicit
      materializer: Materializer,
      applicationContext: ApplicationContext,
      executionContext: ExecutionContext,
  ): List[EssentialFilter] =
    List(
      new H2PreloadFilter,
    )

}

class CommonFilters(frontendBuildInfo: FrontendBuildInfo)(implicit
    mat: Materializer,
    applicationContext: ApplicationContext,
    executionContext: ExecutionContext,
) extends HttpFilters {
  val filters = Filters.common(frontendBuildInfo)
}

class PreloadFilters(implicit
    mat: Materializer,
    applicationContext: ApplicationContext,
    executionContext: ExecutionContext,
) extends HttpFilters {
  val filters = Filters.preload
}

class CommonGzipFilter @Inject() (implicit
    mat: Materializer,
) extends HttpFilters {
  val filters = Seq(new Gzipper)
}
