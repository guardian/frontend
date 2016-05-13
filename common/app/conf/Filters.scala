package conf

import akka.agent.Agent
import cache.SurrogateKey
import common.{Logging, ExecutionContexts}
import conf.switches.Switches
import filters.RequestLoggingFilter
import implicits.Responses._
import org.joda.time.DateTime
import play.api.mvc.{EssentialFilter, Filter, RequestHeader, Result}
import play.filters.gzip.GzipFilter
import play.api.mvc.Results.ServiceUnavailable

import scala.collection.immutable.Queue
import scala.concurrent.Future

object Gzipper extends GzipFilter(shouldGzip = (_, resp) => !resp.isImage)

object JsonVaryHeadersFilter extends Filter with ExecutionContexts with implicits.Requests {

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
object BackendHeaderFilter extends Filter with ExecutionContexts {

  private lazy val backendHeader = "X-Gu-Backend-App" -> conf.Configuration.environment.projectName

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map(_.withHeaders(backendHeader))
  }
}

// See https://www.fastly.com/blog/surrogate-keys-part-1/
object SurrogateKeyFilter extends Filter with ExecutionContexts {

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

object AmpFilter extends Filter with ExecutionContexts with implicits.Requests {
  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (request.isAmp) {
      val domain = request.headers.get("Origin").getOrElse("https://" + request.domain)
      val exposeAmpHeader = "Access-Control-Expose-Headers" -> "AMP-Access-Control-Allow-Source-Origin"
      val ampHeader = "AMP-Access-Control-Allow-Source-Origin" -> Configuration.amp.baseUrl

      nextFilter(request).map(_.withHeaders(exposeAmpHeader, ampHeader))
    } else {
      nextFilter(request)
    }
  }
}

// this turns requests away with 5xx errors if we are too busy
object PanicSheddingFilter extends Filter with Logging {

  import scala.concurrent.duration._
  import scala.concurrent.ExecutionContext.Implicits.global

  val LATENCY_LIMIT = 1.second
  // always allow 32 concurrent connections even in slow times
  val MIN_CONNECTIONS = 32

  val averageLatency = Agent(LatencyMonitor.initialLatency)
  val inFlightLatency = Agent(InFlightLatencyMonitor.initialLatency)

  // Busy monitoring is not perfect as it only knows when things are already slow.
  // if we get loads of requests at the same moment, it would take up to 1 second to realise
  // and start throttling
  // also if the request rate keeps going up there would be plenty of "young" requests to skew the average down
  def available =
    inFlightLatency.get.requestStarts <= MIN_CONNECTIONS || (
      inFlightLatency.get.latency(DateTime.now.getMillis) <= LATENCY_LIMIT.toMillis &&
        averageLatency.get.latency <= LATENCY_LIMIT.toMillis
      )

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    val startTime = DateTime.now.getMillis
    val result = if (available) {
      nextFilter(request)
    } else if (Switches.PanicSheddingSwitch.isSwitchedOn) {
      log.warn("server too busy - responding 5xx")
      Future.successful(ServiceUnavailable)
    } else {
      log.warn("server too busy - having a go at responding anyway")
      nextFilter(request)
    }
    inFlightLatency.send(InFlightLatencyMonitor.requestStarted(startTime)_)
    result.onComplete { _ =>
      inFlightLatency.send(InFlightLatencyMonitor.requestComplete(startTime)_)
      averageLatency.send(LatencyMonitor.updateLatency(DateTime.now.getMillis - startTime)_)
    }
    result
  }

}

object InFlightLatencyMonitor extends ExecutionContexts {

  case class InFlightLatency(requestStarts: Long, lastUpdateTime: Long, totalLatency: Long) {
    def latency(now: Long) = ((now - lastUpdateTime) * requestStarts) + (if (requestStarts == 0) 0 else totalLatency / requestStarts)
  }

  val initialLatency = InFlightLatency(requestStarts = 0, lastUpdateTime = 0, totalLatency = 0)

  def requestStarted(startTime: Long)(inFlightLatency: InFlightLatency) = {
    val InFlightLatency(requestStarts, lastUpdateTime, total) = inFlightLatency
    val newTotal = total + ((startTime - lastUpdateTime) * requestStarts)
    InFlightLatency(requestStarts + 1, startTime, newTotal)
  }

  def requestComplete(startTime: Long)(inFlightLatency: InFlightLatency) = {
    val InFlightLatency(requestStarts, lastUpdateTime, total) = inFlightLatency
    InFlightLatency(requestStarts - 1, lastUpdateTime, total - (lastUpdateTime - startTime))
  }

}

object LatencyMonitor extends ExecutionContexts {

  case class AverageLatency(latencies: Queue[Long], total: Long) {
    def latency = total / latencies.length
  }

  val initialLatency = AverageLatency(Queue(), 0)

  val LATENCY_MAX_SAMPLES = 128

  def updateLatency(thisRequestLatencyMs: Long)(averageLatency: AverageLatency): AverageLatency = {
    val AverageLatency(latencies, total) = averageLatency
    val newLatencies = latencies.enqueue(thisRequestLatencyMs)
    val newTotal = total + thisRequestLatencyMs
    val newLatency = if (newLatencies.length > LATENCY_MAX_SAMPLES) {
      val (removed, removedQueue) = newLatencies.dequeue
      AverageLatency(removedQueue, newTotal - removed)
    } else {
      AverageLatency(newLatencies, newTotal)
    }
    newLatency
  }
}

object Filters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val common: List[EssentialFilter] = List(
    JsonVaryHeadersFilter,
    Gzipper,
    BackendHeaderFilter,
    RequestLoggingFilter,
    SurrogateKeyFilter,
    AmpFilter,
    PanicSheddingFilter
  )
}
