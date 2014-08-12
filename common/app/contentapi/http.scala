package contentapi

import java.net.InetAddress
import java.util.concurrent.TimeoutException

import com.gu.openplatform.contentapi.connection.{Http, HttpResponse}
import common.ContentApiMetrics.ContentApi404Metric
import common.ExecutionContexts
import conf.Configuration
import conf.Configuration.contentApi.previewAuth
import metrics.{CountMetric, FrontendTimingMetric}
import play.api.libs.ws.{WS, WSAuthScheme}

import scala.concurrent.Future
import scala.util.Try

class WsHttp(val httpTimingMetric: FrontendTimingMetric, val httpTimeoutMetric: CountMetric) extends Http[Future]
                                                                                              with ExecutionContexts {

  import java.lang.System.currentTimeMillis

import play.api.Play.current

  override def GET(url: String, headers: Iterable[(String, String)]) = {

    //append with a & as there are always params in there already
    val urlWithDebugInfo = s"$url&${RequestDebugInfo.debugParams}"

    val contentApiTimeout = Configuration.contentApi.timeout

    val start = currentTimeMillis

    val baseRequest = WS.url(urlWithDebugInfo)
    val request = previewAuth.fold(baseRequest)(auth => baseRequest.withAuth(auth.user, auth.password, WSAuthScheme.BASIC))
    val response = request.withHeaders(headers.toSeq: _*).withRequestTimeout(contentApiTimeout).get()

    // record metrics
    response.onSuccess {
      case r if r.status == 404 => ContentApi404Metric.increment()
      case r if r.status == 200 => httpTimingMetric.recordDuration(currentTimeMillis - start)
    }

    response.onFailure {
      case e: Throwable if isTimeout(e) => httpTimeoutMetric.increment()
    }

    response
  }.map {
    r => HttpResponse(r.body, r.status, r.statusText)
  }


  private def isTimeout(e: Throwable): Boolean = e match {
    case t: TimeoutException => true
    case _  => false
  }
}

// allows us to inject a test Http
trait DelegateHttp extends Http[Future] with ExecutionContexts {

  val httpTimingMetric: FrontendTimingMetric
  val httpTimeoutMetric: CountMetric

  private var _http: Http[Future] = new WsHttp(httpTimingMetric, httpTimeoutMetric)

  def http = _http
  def http_=(delegateHttp: Http[Future]) { _http = delegateHttp }

  override def GET(url: String, headers: scala.Iterable[scala.Tuple2[String, String]]) = _http.GET(url, headers)
}

private object RequestDebugInfo {

  import java.net.URLEncoder.encode

  private lazy val host: String = Try(InetAddress.getLocalHost.getCanonicalHostName).getOrElse("unable-to-determine-host")
  private lazy val stage: String = Configuration.environment.stage
  private lazy val project: String = Configuration.environment.projectName

  lazy val debugParams = Seq(
    s"ngw-host=${encode(host, "UTF-8")}",
    s"ngw-stage=${encode(stage, "UTF-8")}",
    s"ngw-project=${encode(project, "UTF-8")}"
  ).mkString("&")

}