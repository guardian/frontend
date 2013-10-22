package contentapi

import com.gu.openplatform.contentapi.connection.{HttpResponse, Http}
import scala.concurrent.Future
import conf.Configuration
import common.ExecutionContexts
import java.util.concurrent.TimeoutException
import play.api.libs.ws.WS
import com.gu.management.{CountMetric, TimingMetric}

class WsHttp(val httpTimingMetric: TimingMetric, val httpTimeoutMetric: CountMetric) extends Http[Future]
                                                                                              with ExecutionContexts {

  import System.currentTimeMillis
  import Configuration.hostMachine
  import java.net.URLEncoder.encode

  override def GET(url: String, headers: Iterable[(String, String)]) = {
    val urlWithHost = url + s"&host-name=${encode(hostMachine.name, "UTF-8")}"

    val contentApiTimeout = Configuration.contentApi.timeout

    val start = currentTimeMillis

    val response = WS.url(urlWithHost).withHeaders(headers.toSeq: _*).withRequestTimeout(contentApiTimeout).get()

    // record metrics
    response.onSuccess {
      case _ => httpTimingMetric.recordTimeSpent(currentTimeMillis - start)
    }
    response.onFailure {
      case e: Throwable if isTimeout(e) => httpTimeoutMetric.increment
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

  val httpTimingMetric: TimingMetric
  val httpTimeoutMetric: CountMetric

  private var _http: Http[Future] = new WsHttp(httpTimingMetric, httpTimeoutMetric)

  def http = _http
  def http_=(delegateHttp: Http[Future]) { _http = delegateHttp }

  override def GET(url: String, headers: scala.Iterable[scala.Tuple2[String, String]]) = _http.GET(url, headers)
}

