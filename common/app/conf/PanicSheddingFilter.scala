package conf

import java.lang.management.ManagementFactory

import akka.agent.Agent
import common.{ExecutionContexts, RequestMetrics, Logging}
import conf.switches.Switches
import org.joda.time.DateTime
import play.api.mvc.Results._
import play.api.mvc.{Result, RequestHeader, Filter}

import scala.concurrent.Future

// this turns requests away with 5xx errors if we are too busy
class PanicSheddingFilter extends Filter with Logging {

  import scala.concurrent.ExecutionContext.Implicits.global
  import scala.concurrent.duration._

  val NORMAL_LATENCY_LIMIT = 1.second.toMillis
  val CRITICAL_LATENCY_LIMIT = 3.seconds.toMillis
  // always allow a few concurrent connections even in slow times
  val TRICKLE_RECOVERY_CONCURRENT_CONNECTIONS = 4
  val WORST_ALLOWABLE_SURGE = SurgeFactorMonitor.RANGE / 4
  val RANGE = SurgeFactorMonitor.RANGE

  val latencyCounter = Agent(LatencyMonitor.initialLatency)
  val requestsInProgressCounter = Agent(RequestsInProgressMonitor.initialRequestsInProgress)
  val surgeFactorCounter = Agent(SurgeFactorMonitor.initialRatio)

  // Busy monitoring is not perfect as it only knows when things are already slow.
  // if we get loads of requests at the same moment, it would take up to 1 second to realise
  // and start throttling
  // also if the request rate keeps going up there would be plenty of "young" requests to skew the average down
  def available(request: RequestHeader) = {

    import implicits.Requests._
    // we read all the values up front, so there could be other requests ahead of us that would affect the values (race)
    val latency = latencyCounter.get.latency
    val requestsInProgress = requestsInProgressCounter.get
    val surgeFactor = surgeFactorCounter.get.ratio
    lazy val loadAverage = ManagementFactory.getOperatingSystemMXBean.getSystemLoadAverage

    def logIt(message: Option[String]) = {
      val debugMessage = s"$requestsInProgress requests in progress, averageLatency = ${latency}ms, surgeFactor = $surgeFactor (range is -$RANGE,$RANGE, over $WORST_ALLOWABLE_SURGE is a spike), loadAverage = $loadAverage"
      logInfoWithCustomFields(
        message.map(message => s"$message $debugMessage").getOrElse(debugMessage),
        List(
          "panic.averageLatency.millis" -> latency,
          "panic.requestsInProgress" -> requestsInProgress,
          "panic.surgeFactor" -> surgeFactor
        )
      )
    }

    if (Switches.PanicLoggingSwitch.isSwitchedOn) {
      logIt(None)
    }

    if (latency > NORMAL_LATENCY_LIMIT) {
      // need to let AWS know the problem so it can scale up
      RequestMetrics.HighLatencyMetric.increment()
    }

    if (request.isHealthcheck) {
      true
    } else if (surgeFactor > WORST_ALLOWABLE_SURGE) {
      logIt(Some("Request spike detected, won't serve this request."))
      RequestMetrics.PanicRequestsSurgeMetric.increment()
      false
    } else if (latency <= NORMAL_LATENCY_LIMIT) {
      true
    } else if (latency > CRITICAL_LATENCY_LIMIT) {
      if (requestsInProgress <= TRICKLE_RECOVERY_CONCURRENT_CONNECTIONS) {
        logIt(Some(
          s"""Excessive latency detected, serving anyway as in progress requests ($requestsInProgress)
             | is less than the minimum ($TRICKLE_RECOVERY_CONCURRENT_CONNECTIONS).
             | """.stripMargin))
        true
      } else {
        logIt(Some("Excessive previous latency detected, won't serve this request."))
        false
      }
    } else {
      val openingRange = CRITICAL_LATENCY_LIMIT - NORMAL_LATENCY_LIMIT
      val msAwayFromFullyOff = CRITICAL_LATENCY_LIMIT - latency
      val percentageOfRequestsToServe = msAwayFromFullyOff * 100 / openingRange
      logIt(Some(s"Moderately high latency, only serving $percentageOfRequestsToServe% of requests."))
      scala.util.Random.nextInt(100) < percentageOfRequestsToServe
    }
  }

  override def apply(nextFilter: (RequestHeader) => Future[Result])(request: RequestHeader): Future[Result] = {
    if (!Switches.PanicMonitoringSwitch.isSwitchedOn) {
      nextFilter(request)
    } else if (available(request)) {
      monitor(nextFilter(request))
    } else if (Switches.PanicSheddingSwitch.isSwitchedOn) {
      Future.successful(ServiceUnavailable)
    } else {
      log.warn("panic-shedding switch disabled - having a go at responding anyway")
      monitor(nextFilter(request))
    }
  }

  def monitor(result: => Future[Result]) = {
    val startedResult = result
    val startTime = DateTime.now.getMillis
    requestsInProgressCounter.send(RequestsInProgressMonitor.requestStarted)
    surgeFactorCounter.send(SurgeFactorMonitor.requestStarted)
    startedResult.onComplete { _ =>
      requestsInProgressCounter.send(RequestsInProgressMonitor.requestComplete)
      surgeFactorCounter.send(SurgeFactorMonitor.requestComplete)
      latencyCounter.send(LatencyMonitor.updateLatency(DateTime.now.getMillis - startTime)_)
    }
    startedResult
  }

}

object SurgeFactorMonitor extends ExecutionContexts {

  case class StartCompleteRatio(total: Long) {
    def ratio = total / LIMIT_SUM_DECAY
  }

  val RANGE = 100

  val initialRatio = StartCompleteRatio(0)

  val DECAY_PERCENT = 99
  val LIMIT_SUM_DECAY = 100 // 1 + 0.99 + (0.99**2) + (0.99**3) ...

  def request(start: Boolean)(startCompleteRatio: StartCompleteRatio) = {
    val StartCompleteRatio(total) = startCompleteRatio
    val newTotal = ((total * DECAY_PERCENT) / 100) + (if (start) RANGE else -RANGE)
    StartCompleteRatio(newTotal)
  }

  def requestStarted = request(start = true)_

  def requestComplete = request(start = false)_

}

object RequestsInProgressMonitor extends ExecutionContexts {

  val initialRequestsInProgress = 0

  def request(start: Boolean)(requestsInProgress: Int) = {
    requestsInProgress + (if (start) 1 else -1)
  }

  def requestStarted = request(start = true)_

  def requestComplete = request(start = false)_

}

object LatencyMonitor extends ExecutionContexts {

  case class AverageLatency(total: Long, upperBound: Long) {
    def latency = if (upperBound == 0) 0L else (total * SAMPLE_MULTIPLE) / upperBound
  }

  val initialLatency = AverageLatency(0, 0)

  val DECAY_PERCENT = 90 // this will cause it to converge at 10x latency as samples are added 1 + 0.9 + (0.9**2) + (0.9**3) ...
  val SAMPLE_MULTIPLE = 10000 // just a big enough number so we don't get rounding errors

  def updateLatency(thisRequestLatencyMs: Long)(averageLatency: AverageLatency): AverageLatency = {
    val AverageLatency(total, upperBound) = averageLatency
    val newTotal = ((total * DECAY_PERCENT) / 100) + thisRequestLatencyMs
    val newUpperBound = ((upperBound * DECAY_PERCENT) / 100) + SAMPLE_MULTIPLE
    AverageLatency(newTotal, newUpperBound)
  }

}
