package contentapi

import java.net.{InetAddress, URI}
import java.util.concurrent.TimeoutException

import common.ContentApiMetrics.{ContentApi404Metric, ContentApiErrorMetric, ContentApiRequestsMetric}
import common.{ContentApiMetrics, GuLogging}
import conf.Configuration
import conf.Configuration.contentApi.capiPreviewCredentials
import play.api.libs.ws.WSClient
import com.gu.contentapi.client.IAMSigner

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

case class Response(body: Array[Byte], status: Int, statusText: String)

/**
  * CAPI preview uses IAM authorization.
  * The signer generates AWS sig4v signed headers based on the request and the capi credentials
  */
object PreviewSigner {
  def apply() = new IAMSigner(capiPreviewCredentials, common.Environment.awsRegion)
}

trait HttpClient {
  def GET(url: String, headers: Iterable[(String, String)]): Future[Response]
}

class CapiHttpClient(wsClient: WSClient)(implicit executionContext: ExecutionContext)
    extends HttpClient
    with GuLogging {

  import java.lang.System.currentTimeMillis

  val signer: Option[IAMSigner] = None

  private def addAuthHeaders(headers: Iterable[(String, String)], url: String): Iterable[(String, String)] =
    signer.fold(headers)(_.addIAMHeaders(headers.toMap, URI.create(url)))

  def GET(url: String, headers: Iterable[(String, String)]): Future[Response] = {
    //append with a & as there are always params in there already
    val urlWithDebugInfo = s"$url&${RequestDebugInfo.debugParams}"

    val contentApiTimeout = Configuration.contentApi.timeout

    val start = currentTimeMillis

    val baseRequest = wsClient.url(urlWithDebugInfo)

    val headersWithAuth = addAuthHeaders(headers, urlWithDebugInfo)

    val response = baseRequest.withHttpHeaders(headersWithAuth.toSeq: _*).withRequestTimeout(contentApiTimeout).get()

    // record metrics

    response.foreach((f) => { ContentApiRequestsMetric.increment() })

    response.foreach {
      case r if r.status == 404 => ContentApi404Metric.increment()
      case r if r.status == 200 => ContentApiMetrics.HttpLatencyTimingMetric.recordDuration(currentTimeMillis - start)
      case _                    =>
    }

    response.failed.foreach {
      case e: TimeoutException =>
        log.warn(s"Content API TimeoutException for $url in ${currentTimeMillis - start}: $e")
        ContentApiMetrics.HttpTimeoutCountMetric.increment()
      case e: Exception =>
        log.warn(s"Content API client exception for $url in ${currentTimeMillis - start}: $e")
    }

    response onComplete {
      case Success(r) if r.status >= 500 =>
        ContentApiErrorMetric.increment()
      case Failure(_) =>
        ContentApiErrorMetric.increment()
      case _ =>
    }

    response map { wsResponse =>
      Response(wsResponse.bodyAsBytes.toArray, wsResponse.status, wsResponse.statusText)
    }
  }
}

private object RequestDebugInfo {
  import java.net.URLEncoder.encode

  private lazy val host: String =
    Try(InetAddress.getLocalHost.getCanonicalHostName).getOrElse("unable-to-determine-host")
  private lazy val stage: String = Configuration.environment.stage
  private lazy val project: String = Configuration.environment.app

  lazy val debugParams = Seq(
    s"ngw-host=${encode(host, "UTF-8")}",
    s"ngw-stage=${encode(stage, "UTF-8")}",
    s"ngw-project=${encode(project, "UTF-8")}",
  ).mkString("&")
}
