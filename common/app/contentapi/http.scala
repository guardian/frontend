package contentapi

import com.gu.openplatform.contentapi.connection.{HttpResponse, Http}
import scala.concurrent.Future
import conf.Configuration
import common.{ExecutionContexts, TimingMetricLogging, Logging}
import play.api.libs.ws.WS
import java.util.concurrent.TimeoutException
import com.gu.management.{Metric, CountMetric, TimingMetric}

import com.gu.openplatform.contentapi.util.FutureInstances._

trait DelegateHttp extends Http[Future] with ExecutionContexts {
  import System.currentTimeMillis
  import ContentApiMetrics._
  import Configuration.host
  import java.net.URLEncoder.encode

  private val wsHttp = new Http[Future] with Logging {
    override def GET(url: String, headers: Iterable[(String, String)]) = {
      val urlWithHost = url + s"&host-name=${encode(host.name, "UTF-8")}"

      val start = currentTimeMillis
      val response = WS.url(urlWithHost).withHeaders(headers.toSeq: _*).withTimeout(2000).get()

      // record metrics
      response.onSuccess{ case _ => HttpTimingMetric.recordTimeSpent(currentTimeMillis - start) }
      response.onFailure{ case e: Throwable if isTimeout(e) => HttpTimeoutCountMetric.increment }
      response
    }.map{ r => HttpResponse(r.body, r.status, r.statusText)}
  }

  private var _http: Http[Future] = wsHttp
  def http = _http
  def http_=(delegateHttp: Http[Future]) = _http = delegateHttp

  override def GET(url: String, headers: scala.Iterable[scala.Tuple2[String, String]]) = _http.GET(url, headers)

  private def isTimeout(e: Throwable): Boolean = Option(e.getCause)
    .map(_.getClass == classOf[TimeoutException])
    .getOrElse(false)
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

  object DogpileHitsCountMetric extends CountMetric(
    "performance",
    "content-api-dogpile-hits",
    "Content API dogpile hits",
    "Hits to the content api dogpile cache"
  )

  val all: Seq[Metric] = Seq(HttpTimingMetric, HttpTimeoutCountMetric, DogpileHitsCountMetric)
}
