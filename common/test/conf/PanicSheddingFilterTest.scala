package conf

import org.scalatest.{AppendedClues, FlatSpec, Matchers}

import scala.collection.immutable.Queue

class LatencyMonitorTest extends FlatSpec with Matchers with AppendedClues {

  import LatencyMonitor._

  "LatencyMonitor" should "have 2 latency after a single request" in {
    updateLatency(2)(initialLatency) should be(AverageLatency(Queue(2), 2))
  }

  "LatencyMonitor" should "have 6 latency after (2, 4) request" in {
    updateLatency(4)(updateLatency(2)(initialLatency)) should be(AverageLatency(Queue(2, 4), 6))
  }

  "LatencyMonitor" should "have 10000 latency after a 1001 req" in {
    val one = updateLatency(0)(initialLatency)
    val result = (0 to LATENCY_MAX_SAMPLES).foldLeft(one)({ (prev, _) => updateLatency(10)(prev) })
    result.copy(latencies = Queue()) should be(AverageLatency(Queue(), LATENCY_MAX_SAMPLES*10))
  }

}

class InFlightLatencyMonitorTest extends FlatSpec with Matchers with AppendedClues {

  import InProgressRequestMonitor._

  "LatencyMonitor" should "have 2 latency after a single request" in {
    val added = requestStarted(2)(initialRequestsInProgress)
    added should be(InFlightLatency(requestStarts = 1, lastUpdateTime = 2, totalLatency = 0))
    added.latency(2) should be(0)
    added.latency(4) should be(2)
    val removed = requestComplete(2)(added)
    removed should be(InFlightLatency(requestStarts = 0, lastUpdateTime = 2, totalLatency = 0))
    removed.latency(4) should be(0)
    removed.latency(6) should be(0)
  }

  "LatencyMonitor" should "be able to add 2 and remove 2" in {
    val added = requestStarted(2)(initialRequestsInProgress)
    added should be(InFlightLatency(requestStarts = 1, lastUpdateTime = 2, totalLatency = 0))
    val addedAgain = requestStarted(4)(added)
    addedAgain should be(InFlightLatency(requestStarts = 2, lastUpdateTime = 4, totalLatency = 2))
    addedAgain.latency(4) should be(1)
    addedAgain.latency(6) should be(5)
    val removed = requestComplete(4)(addedAgain)
    removed should be(InFlightLatency(requestStarts = 1, lastUpdateTime = 4, totalLatency = 2))
    val removedAgain = requestComplete(2)(removed)
    removedAgain should be(InFlightLatency(requestStarts = 0, lastUpdateTime = 4, totalLatency = 0))
  }

}
