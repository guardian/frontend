package contentapi

import com.gu.openplatform.contentapi.connection.{Dispatch, HttpResponse, Http}
import scala.concurrent.{Promise, Future}
import conf.Configuration
import common.{Logging, ExecutionContexts, TimingMetricLogging}
import java.util.concurrent.TimeoutException
import com.gu.management.{GaugeMetric, Metric, CountMetric, TimingMetric}
import org.apache.http.impl.nio.client.DefaultHttpAsyncClient
import org.apache.http.params.CoreConnectionPNames
import org.apache.http.client.methods.{HttpUriRequest, HttpGet}
import org.apache.http.concurrent.FutureCallback
import org.apache.http.{HttpResponse => ApacheResponse}
import org.apache.commons.io.IOUtils
import org.apache.http.impl.nio.reactor.{IOReactorConfig, DefaultConnectingIOReactor}
import org.apache.http.impl.nio.conn.PoolingClientAsyncConnectionManager
import java.net.SocketTimeoutException
import play.api.GlobalSettings
import org.apache.http.client.entity.GzipDecompressingEntity

trait ApacheHttp extends Http[Future] with ExecutionContexts with Logging {

  import ApacheHttp._
  import System.currentTimeMillis
  import ContentApiMetrics._
  import Configuration.host
  import java.net.URLEncoder.encode

  def GET(url: String, headers: Iterable[(String, String)]): Future[HttpResponse] = {

    val urlWithHost = url + s"&host-name=${encode(host.name, "UTF-8")}"

    val request: HttpUriRequest = new HttpGet(urlWithHost)

    headers.map{ case (name, value) => request.addHeader(name, value)}

    request.addHeader("Accept-Encoding", "gzip")

    val promise = Promise[HttpResponse]()

    val start = currentTimeMillis

    client.execute(request, new FutureCallback[ApacheResponse] {

      def completed(result: ApacheResponse) {
        val status = result.getStatusLine
        promise.success(HttpResponse(readBody(result), status.getStatusCode, status.getReasonPhrase))
        HttpTimingMetric.recordTimeSpent(currentTimeMillis - start)
      }

      def failed(ex: Exception) {
        log.error(s"Content api exception loading $url", ex)
        ex match {
          case t: SocketTimeoutException =>
            HttpTimeoutCountMetric.increment()
            promise.success(HttpResponse("", 504, "Timeout"))

          // TODO
          case other => promise.success(HttpResponse("", 500, "Some upstream error"))
        }
      }

      def cancelled() {
        log.info(s"Content api cancelled $url")
      }
    })

    promise.future
  }

  private def isGzipped(result: ApacheResponse): Boolean = {
    Option(result.getFirstHeader("Content-Encoding")).map(_.getValue == "gzip").getOrElse(false)
  }

  private def readBody(result: ApacheResponse) = IOUtils.toString(
      if (isGzipped(result))
        new GzipDecompressingEntity(result.getEntity).getContent
      else
        result.getEntity.getContent
      , "UTF-8")
}

object ApacheHttp {

  lazy val connectionPool = {
    val p = new PoolingClientAsyncConnectionManager(new DefaultConnectingIOReactor(new IOReactorConfig))
    p.setMaxTotal(100)
    p.setDefaultMaxPerRoute(100)
    p
  }

  lazy val client = {
    val c = new DefaultHttpAsyncClient(connectionPool)
    c.getParams
      .setBooleanParameter(CoreConnectionPNames.SO_KEEPALIVE,true)
      .setIntParameter(CoreConnectionPNames.SO_TIMEOUT,1500)
      .setIntParameter(CoreConnectionPNames.CONNECTION_TIMEOUT, 1000)
      .setIntParameter(CoreConnectionPNames.SOCKET_BUFFER_SIZE, 8 * 1024)
      .setBooleanParameter(CoreConnectionPNames.TCP_NODELAY, true)
      .setBooleanParameter(CoreConnectionPNames.STALE_CONNECTION_CHECK, false)
    c.start()
    c
  }
}

trait ApacheHttpLifecycle extends GlobalSettings {
  override def onStop(app: play.api.Application) {
    super.onStop(app)
    ApacheHttp.client.shutdown()
  }
}


// allows us to inject a test Http
trait DelegateHttp extends Http[Future] with ExecutionContexts {

  private var _http: Http[Future] = new ApacheHttp {}

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

  object ConnectionPoolSize extends GaugeMetric("content-api",
    "connection-pool-size",
    "Connection pool size",
    "Max connections in the connection pool",
    () => ApacheHttp.connectionPool.getTotalStats.getMax
  )

  object ConnectionPoolLeased extends GaugeMetric("content-api",
    "connection-pool-leased",
    "Connection pool leased",
    "Connections leased (in use) by the connection pool",
    () => ApacheHttp.connectionPool.getTotalStats.getLeased
  )

  object ConnectionPoolPending extends GaugeMetric("content-api",
    "connection-pool-pending",
    "Connection pool pending",
    "Connections pending for the connection pool",
    () => ApacheHttp.connectionPool.getTotalStats.getPending
  )

  object ConnectionPoolAvailable extends GaugeMetric("content-api",
    "connection-pool-available",
    "Connection pool available",
    "Connections available (alive) in the connection pool",
    () => ApacheHttp.connectionPool.getTotalStats.getAvailable
  )

  val all: Seq[Metric] = Seq(
    HttpTimingMetric, HttpTimeoutCountMetric, ConnectionPoolSize,
    ConnectionPoolLeased, ConnectionPoolPending, ConnectionPoolAvailable
  )
}
