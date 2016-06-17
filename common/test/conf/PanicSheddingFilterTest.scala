package conf

import org.scalatest.{AppendedClues, FlatSpec, Matchers}

class LatencyMonitorTest extends FlatSpec with Matchers with AppendedClues {

  import LatencyMonitor._

  "LatencyMonitor" should "have no latency after no request" in {
    initialLatency.latency should be(0)
  }

  "LatencyMonitor" should "weight the latency of initial requests up on startup" in {
    // if we only had one request but it was slow, we should respect that to give us time to warm up
    val TEST_LATENCY = 12345L
    val result = updateLatency(TEST_LATENCY)(initialLatency)

    result.latency should be (TEST_LATENCY)
  }

  "LatencyMonitor" should "approach the actual latency over time" in {
    val TEST_LATENCY = 12345L
    val result = (0 to 1000).foldLeft(initialLatency)({ (prev, _) => updateLatency(TEST_LATENCY)(prev) })

    result.latency should be > (TEST_LATENCY*0.99).toLong
    result.latency should be <= TEST_LATENCY
  }

  "LatencyMonitor" should "approach the actual latency over time even if it's been higher" in {
    val TEST_LATENCY = 12345L
    val TEST_LATENCY_2 = 300L
    val intermediate = (0 to 1000).foldLeft(initialLatency)({ (prev, _) => updateLatency(TEST_LATENCY)(prev) })
    val result = (0 to 1000).foldLeft(intermediate)({ (prev, _) => updateLatency(TEST_LATENCY_2)(prev) })

    result.latency should be >= TEST_LATENCY_2
    result.latency should be < (TEST_LATENCY_2*1.01).toLong
  }

}

class StartCompleteRatioMonitorTest extends FlatSpec with Matchers with AppendedClues {

  import SurgeFactorMonitor._

  "LatencyMonitor" should "have 0 ratio after no request" in {
    initialRatio should be(StartCompleteRatio(0))
    initialRatio.ratio should be(0)
  }

  "LatencyMonitor" should "go up within 30 requests then down when starting/stopping requests" in {
    val result = (0 to 30).foldLeft(initialRatio)({ (prev, _) => requestStarted(prev) })
    result.ratio should be > 25L
    val after = (0 to 30).foldLeft(initialRatio)({ (prev, _) => requestComplete(prev) })
    after.ratio should be < 0L
  }

  "LatencyMonitor" should "not go too high within 20 requests" in {
    val result = (0 to 20).foldLeft(initialRatio)({ (prev, _) => requestStarted(prev) })
    result.ratio should be < 25L
  }

}


class InFlightLatencyMonitorTest extends FlatSpec with Matchers with AppendedClues {

  import RequestsInProgressMonitor._

  "LatencyMonitor" should "have 2 latency after a single request" in {
    val added = requestStarted(initialRequestsInProgress)
    added should be(1)
    val removed = requestComplete(added)
    removed should be(0)
  }

  "LatencyMonitor" should "be able to add 2 and remove 2" in {
    val added = requestStarted(initialRequestsInProgress)
    added should be(1)
    val addedAgain = requestStarted(added)
    addedAgain should be(2)
    val removed = requestComplete(addedAgain)
    removed should be(1)
    val removedAgain = requestComplete(removed)
    removedAgain should be(0)
  }

}
