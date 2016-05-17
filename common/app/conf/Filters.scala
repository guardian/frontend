package conf

import akka.agent.Agent
import cache.SurrogateKey
import common.{RequestMetrics, Logging, ExecutionContexts}
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

  val ALL_200s_MAX_LATENCY = 1.second.toMillis
  val PANICING_MIN_LATENCY = 3.seconds.toMillis
  // always allow a few concurrent connections even in slow times
  val MIN_CONNECTIONS = 4
  val INITIAL_CONNECTIONS = 512

  val averageLatency = Agent(LatencyMonitor.initialLatency)
  val inFlightLatency = Agent(InFlightLatencyMonitor.initialLatency)
  val concurrentConnections = Agent(INITIAL_CONNECTIONS)

  // Busy monitoring is not perfect as it only knows when things are already slow.
  // if we get loads of requests at the same moment, it would take up to 1 second to realise
  // and start throttling
  // also if the request rate keeps going up there would be plenty of "young" requests to skew the average down
  def available(request: RequestHeader) = {
    import implicits.Requests._
    // assume uncompleted requests are half way through on average, although if we get a sudden flood this assumption doesn't hold
    val currentInflightLatency = inFlightLatency.get.latency(DateTime.now.getMillis) * 2
    val previousLatency = averageLatency.get.latency
    val requestsInProgress = inFlightLatency.get.requestStarts
    log.info(s"$requestsInProgress: currentInFlightLatency = $currentInflightLatency and averageLatency = $previousLatency")
//    if (inFlightLatency.get.requestStarts <= MIN_CONNECTIONS) {
//      true
//    } else {
      val worstLatency = Math.max(currentInflightLatency, previousLatency)
      if (worstLatency <= ALL_200s_MAX_LATENCY) {
        if (requestsInProgress >= concurrentConnections.get) {
          concurrentConnections.alter(_ + 1)
        }
        true
      } else if (worstLatency > PANICING_MIN_LATENCY) {
        log.warn(s"server busy, not serving more than $MIN_CONNECTIONS concurrent requests")
        if (requestsInProgress <= concurrentConnections.get) {
          concurrentConnections.alter(Math.max(MIN_CONNECTIONS, requestsInProgress))
        }
        false // even health checks fail
      } else if (request.isHealthcheck) {
        log.warn(s"server busy, allowing health checks through")
        true // if we're partially open serve health checks
      } else {
        concurrentConnections.alter(old => Math.max(MIN_CONNECTIONS, old - 1))
        val openingRange = PANICING_MIN_LATENCY - ALL_200s_MAX_LATENCY
        val msAwayFromFullyOff = PANICING_MIN_LATENCY - worstLatency
        val percentageOfRequestsToServe = msAwayFromFullyOff * 100 / openingRange
        log.warn(s"server busy, only serving $percentageOfRequestsToServe% of requests")
        scala.util.Random.nextInt(100) < percentageOfRequestsToServe
      }
//    }
  }

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (available(request)) {
      monitor(nextFilter(request))
    } else if (Switches.PanicSheddingSwitch.isSwitchedOn) {
      RequestMetrics.RequestsShedMetric.increment()
      Future.successful(ServiceUnavailable)
    } else {
      log.warn("panic switch disabled - having a go at responding anyway")
      RequestMetrics.RequestsShedMetric.increment()
      monitor(nextFilter(request))
    }
  }

  def monitor(result: => Future[Result]) = {
    val startedResult = result
    val startTime = DateTime.now.getMillis
    inFlightLatency.send(InFlightLatencyMonitor.requestStarted(startTime)_)
    startedResult.onComplete { _ =>
      inFlightLatency.send(InFlightLatencyMonitor.requestComplete(startTime)_)
      averageLatency.send(LatencyMonitor.updateLatency(DateTime.now.getMillis - startTime)_)
      log.info(s"request complete in: ${DateTime.now.getMillis - startTime}")
    }
    startedResult
  }

}

object InFlightLatencyMonitor extends ExecutionContexts {

  case class InFlightLatency(requestStarts: Int, lastUpdateTime: Long, totalLatency: Long) {
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
    def latency = total / 99
  }

  val initialLatency = AverageLatency(Queue(), 0)

  val DECAY_PERCENT = 99
  //val LATENCY_MAX_SAMPLES = 128

  def updateLatency(thisRequestLatencyMs: Long)(averageLatency: AverageLatency): AverageLatency = {
    val AverageLatency(latencies, total) = averageLatency
    val newLatencies = Queue()//latencies.enqueue(thisRequestLatencyMs)
    val newTotal = ((total * 100) / DECAY_PERCENT) + thisRequestLatencyMs
//    val newLatency = if (newLatencies.length > LATENCY_MAX_SAMPLES) {
//      val (removed, removedQueue) = newLatencies.dequeue
//      AverageLatency(removedQueue, newTotal - removed)
//    } else {
      AverageLatency(newLatencies, newTotal)
//    }
//    newLatency
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
