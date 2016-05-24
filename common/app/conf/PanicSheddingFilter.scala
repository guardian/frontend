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
object PanicSheddingFilter extends Filter with Logging {

  import scala.concurrent.ExecutionContext.Implicits.global
  import scala.concurrent.duration._

  val ALL_200s_MAX_LATENCY = 1.second.toMillis
  val PANICING_MIN_LATENCY = 3.seconds.toMillis
  // always allow a few concurrent connections even in slow times
  val MIN_CONNECTIONS = 4
  val MAX_STARTS_IMBALANCE = StartCompleteRatioMonitor.RANGE / 4

  val averageLatency = Agent(LatencyMonitor.initialLatency)
  val requestsInProgressCounter = Agent(InProgressRequestMonitor.initialRequestsInProgress)
  val startCompleteRatio = Agent(StartCompleteRatioMonitor.initialRatio)

  // Busy monitoring is not perfect as it only knows when things are already slow.
  // if we get loads of requests at the same moment, it would take up to 1 second to realise
  // and start throttling
  // also if the request rate keeps going up there would be plenty of "young" requests to skew the average down
  def available(request: RequestHeader) = {

    import implicits.Requests._
    // we read all the values up front, so there could be other requests ahead of us that would affect the values (race)
    val previousLatency = averageLatency.get.latency
    val requestsInProgress = requestsInProgressCounter.get
    val startsRatio = startCompleteRatio.get.ratio
    lazy val loadAverage = ManagementFactory.getOperatingSystemMXBean.getSystemLoadAverage
    if (Switches.PanicLoggingSwitch.isSwitchedOn) {
      log.info(s"$requestsInProgress in progress: averageLatency = $previousLatency, startsRatio (range is -100,100) = $startsRatio, loadAverage = $loadAverage")
    }
    if (startsRatio > MAX_STARTS_IMBALANCE) {
      log.warn(s"Request spike detected, won't serve this request - $startsRatio (range is -100 to 100, over 25 is a spike), loadAverage = $loadAverage")
      RequestMetrics.PanicRequestsSurgeMetric.increment()
      false
    } else if (previousLatency <= ALL_200s_MAX_LATENCY) {
      true
    } else if (previousLatency > PANICING_MIN_LATENCY) {
      RequestMetrics.PanicExcessiveLatencyMetric.increment()
      if (requestsInProgress <= MIN_CONNECTIONS) {
        log.warn(s"Excessive previous latency detected, serving anyway as $requestsInProgress/$MIN_CONNECTIONS requests in progress - ${previousLatency}ms, loadAverage = $loadAverage")
        true
      } else {
        log.warn(s"Excessive previous latency detected, won't serve this request - ${previousLatency}ms, loadAverage = $loadAverage")
        false // even health checks fail
      }
    } else if (request.isHealthcheck) {
      log.warn(s"Moderately high latency, allowing health checks through - ${previousLatency}ms, loadAverage = $loadAverage")
      true
    } else {
      RequestMetrics.PanicLatencyWarningMetric.increment()
      val openingRange = PANICING_MIN_LATENCY - ALL_200s_MAX_LATENCY
      val msAwayFromFullyOff = PANICING_MIN_LATENCY - previousLatency
      val percentageOfRequestsToServe = msAwayFromFullyOff * 100 / openingRange
      log.warn(s"Moderately high latency, only serving $percentageOfRequestsToServe% of requests - ${previousLatency}ms, loadAverage = $loadAverage")
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
    requestsInProgressCounter.send(InProgressRequestMonitor.requestStarted)
    startCompleteRatio.send(StartCompleteRatioMonitor.requestStarted)
    startedResult.onComplete { _ =>
      requestsInProgressCounter.send(InProgressRequestMonitor.requestComplete)
      startCompleteRatio.send(StartCompleteRatioMonitor.requestComplete)
      averageLatency.send(LatencyMonitor.updateLatency(DateTime.now.getMillis - startTime)_)
    }
    startedResult
  }

}

object StartCompleteRatioMonitor extends ExecutionContexts {

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

object InProgressRequestMonitor extends ExecutionContexts {

  val initialRequestsInProgress = 0

  def request(start: Boolean)(requestsInProgress: Int) = {
    requestsInProgress + (if (start) 1 else -1)
  }

  def requestStarted = request(start = true)_

  def requestComplete = request(start = false)_

}

object LatencyMonitor extends ExecutionContexts {

  case class AverageLatency(total: Long) {
    def latency = total / LIMIT_SUM_DECAY
  }

  val initialLatency = AverageLatency(0)

  val DECAY_PERCENT = 99
  val LIMIT_SUM_DECAY = 100 // 1 + 0.99 + (0.99**2) + (0.99**3) ...

  def updateLatency(thisRequestLatencyMs: Long)(averageLatency: AverageLatency): AverageLatency = {
    val AverageLatency(total) = averageLatency
    val newTotal = ((total * DECAY_PERCENT) / 100) + thisRequestLatencyMs
    AverageLatency(newTotal)
  }

}
