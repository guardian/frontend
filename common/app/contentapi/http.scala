package contentapi

import com.gu.openplatform.contentapi.connection.{Dispatch, HttpResponse, Http}
import scala.concurrent.Future
import conf.Configuration
import common.{ExecutionContexts, TimingMetricLogging, Logging}
import play.api.libs.ws.WS
import java.util.concurrent.TimeoutException
import com.gu.management.{Metric, CountMetric, TimingMetric}


trait DispatchHttp extends Http[Future] with Dispatch with ExecutionContexts {

  import System.currentTimeMillis
  import ContentApiMetrics._
  import Configuration.host
  import java.net.URLEncoder.encode

  override lazy val maxConnections: Int = 1000
  override lazy val connectionTimeoutInMs: Int = 1000
  override lazy val requestTimeoutInMs: Int = 2000

  // Ignoring Proxy on purpose - we only use it on CI server
  // and you should never call content api directly from there

  override def GET(url: String, headers: Iterable[(String, String)]) = {
    val urlWithHost = url + s"&host-name=${encode(host.name, "UTF-8")}"

    val start = currentTimeMillis
    val response = super.get(urlWithHost, headers)

    // record metrics
    response.onSuccess{ case _ => HttpTimingMetric.recordTimeSpent(currentTimeMillis - start) }
    response.onFailure{ case e: Throwable if isTimeout(e) => HttpTimeoutCountMetric.increment }
    response
  }.map{ r => HttpResponse(r.body, r.statusCode, r.statusMessage)}

  private def isTimeout(e: Throwable): Boolean = Option(e.getCause)
      .map(_.getClass == classOf[TimeoutException])
      .getOrElse(false)
}

// allows us to inject a test Http
trait DelegateHttp extends Http[Future] with ExecutionContexts {

  private var _http: Http[Future] = new DispatchHttp {}

  def http = _http
  def http_=(delegateHttp: Http[Future]) { _http = delegateHttp }

  override def GET(url: String, headers: scala.Iterable[scala.Tuple2[String, String]]) = _http.GET(url, headers)
}

object ContentApiMetrics {
  object HttpTimingMetric extends TimingMetric(
    "performance",
    "content-api-calls",
    "Content API calls",
    "outgoing requests to content api"
  ) with TimingMetricLogging

  object HttpTimeoutCountMetric extends CountMetric(
    "timeout",
    "content-api-timeouts",
    "Content API timeouts",
    "Content api calls that timeout"
  )

  val all: Seq[Metric] = Seq(HttpTimingMetric, HttpTimeoutCountMetric)
}
