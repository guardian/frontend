package contentapi

import java.net.InetAddress
import java.util.concurrent.TimeoutException

import common.ContentApiMetrics.{ContentApi404Metric, ContentApiErrorMetric, ContentApiRequestsMetric}
import common.{ContentApiMetrics, Logging}
import conf.Configuration
import conf.Configuration.contentApi.previewAuth
import play.api.libs.ws.{WSAuthScheme, WSClient}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

case class Response(body: Array[Byte], status: Int, statusText: String)

trait HttpClient {
  def GET(url: String, headers: Iterable[(String, String)]): Future[Response]
}

class CapiHttpClient(wsClient: WSClient)(implicit executionContext: ExecutionContext)
  extends HttpClient with Logging {

  import java.lang.System.currentTimeMillis

  def GET(url: String, headers: Iterable[(String, String)]): Future[Response] = {

    if (common.Environment.stage == "DEVINFRA") {
      System.err.println("WARNING: in DEVINFRA mode RecorderHttpClient content api client client should be used (have you set up a TestAppLoader?).")
    }

    //append with a & as there are always params in there already
    val urlWithDebugInfo = s"$url&${RequestDebugInfo.debugParams}"

    val contentApiTimeout = Configuration.contentApi.timeout

    val start = currentTimeMillis

    val baseRequest = wsClient.url(urlWithDebugInfo)
    val request = previewAuth.fold(baseRequest)(auth => baseRequest.withAuth(auth.user, auth.password, WSAuthScheme.BASIC))
    val response = request.withHttpHeaders(headers.toSeq: _*).withRequestTimeout(contentApiTimeout).get()

    // record metrics

    response.foreach((f)=>{ ContentApiRequestsMetric.increment() })

    response.foreach {
      case r if r.status == 404 => ContentApi404Metric.increment()
      case r if r.status == 200 => ContentApiMetrics.HttpLatencyTimingMetric.recordDuration(currentTimeMillis - start)
      case _ =>
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

  private lazy val host: String = Try(InetAddress.getLocalHost.getCanonicalHostName).getOrElse("unable-to-determine-host")
  private lazy val stage: String = Configuration.environment.stage
  private lazy val project: String = Configuration.environment.app

  lazy val debugParams = Seq(
    s"ngw-host=${encode(host, "UTF-8")}",
    s"ngw-stage=${encode(stage, "UTF-8")}",
    s"ngw-project=${encode(project, "UTF-8")}"
  ).mkString("&")
}
