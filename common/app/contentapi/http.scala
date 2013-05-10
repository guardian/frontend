package contentapi

import com.gu.openplatform.contentapi.connection.{Dispatch, HttpResponse, Http}
import scala.concurrent.{Promise, Future}
import conf.Configuration
import common.{ExecutionContexts, TimingMetricLogging}
import play.api.libs.ws.WS
import java.util.concurrent.TimeoutException
import com.gu.management.{Metric, CountMetric, TimingMetric}
import org.apache.http.impl.nio.client.DefaultHttpAsyncClient
import org.apache.http.params.CoreConnectionPNames
import org.apache.http.client.methods.{HttpUriRequest, HttpGet}
import org.apache.http.message.BasicHeader
import org.apache.http.concurrent.FutureCallback
import org.apache.http.{HttpResponse => ApacheResponse}
import org.apache.commons.io.IOUtils
import java.util.zip.GZIPInputStream
import org.apache.http.impl.client.DefaultRedirectStrategy
import org.apache.http.impl.nio.reactor.{IOReactorConfig, DefaultConnectingIOReactor}
import org.apache.http.impl.nio.conn.PoolingClientAsyncConnectionManager


trait ApacheHttp extends Http[Future] with ExecutionContexts {

  import ApacheHttp._

  def GET(url: String, headers: Iterable[(String, String)]): Future[HttpResponse] = {

    val request: HttpUriRequest = new HttpGet(url)
    headers.map{ case (name, value) => new BasicHeader(name, value)}.foreach(request.addHeader)

    request.addHeader("Accept-Encoding", "gzip")

    val promise = Promise[HttpResponse]

    client.execute(request, new FutureCallback[ApacheResponse] {
      def completed(result: ApacheResponse) {

        val contentStream =
          if (isGzipped(result))
            new GZIPInputStream(result.getEntity.getContent)
          else
            result.getEntity.getContent

        val status = result.getStatusLine

        promise.success(
          HttpResponse(IOUtils.toString(contentStream), status.getStatusCode, status.getReasonPhrase)
        )
      }

      def failed(ex: Exception) {
        // TODO log error
        ex match {
          case t: TimeoutException => promise.success(HttpResponse("", 504, "Timeout"))
          case other => promise.success(HttpResponse("", 500, "Some upstream error"))
        }
      }

      def cancelled() {
        //TODO
      }
    })

    promise.future
  }

  private def isGzipped(result: ApacheResponse): Boolean = {
    Option(result.getFirstHeader("Content-Encoding")).map(_.getValue == "gzip").getOrElse(false)
  }
}

object ApacheHttp {


  val connectionPool = new PoolingClientAsyncConnectionManager(new DefaultConnectingIOReactor(new IOReactorConfig))

  connectionPool.setMaxTotal(100)
  connectionPool.setDefaultMaxPerRoute(100)

  val client = new DefaultHttpAsyncClient(connectionPool)
  client.getParams()
    .setIntParameter(CoreConnectionPNames.SO_TIMEOUT,1000)
    .setIntParameter(CoreConnectionPNames.CONNECTION_TIMEOUT, 1000)
    .setIntParameter(CoreConnectionPNames.SOCKET_BUFFER_SIZE, 8 * 1024)
    .setBooleanParameter(CoreConnectionPNames.TCP_NODELAY, true)
  client.getConnectionManager
  client.start()
}



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
    WS
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
