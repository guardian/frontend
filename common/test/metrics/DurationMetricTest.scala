package metrics

import com.amazonaws.services.cloudwatch.model.StandardUnit
import org.scalatest.{FlatSpec, Matchers}

class DurationMetricTest extends FlatSpec with Matchers {

  "DurationMetric" should "start off empty" in {
    val durationMetric: DurationMetric = DurationMetric("TestMetric", StandardUnit.Count)

    durationMetric.getAndResetDataPoints should be(List())
  }

  it should "record some metrics" in {
    val durationMetric: DurationMetric = DurationMetric("TestMetric", StandardUnit.Count)

    durationMetric.recordDuration(1000)
    durationMetric.recordDuration(1000)
    durationMetric.recordDuration(1000)

    val storedDatapoints = durationMetric.getAndResetDataPoints

    storedDatapoints.length should be(3)
    storedDatapoints.forall(_.value == 1000) should be(true)

    durationMetric.getAndResetDataPoints.length should be(0)
  }

  it should "add datapoints to the head of the list" in {
    val durationMetric: DurationMetric = DurationMetric("TestMetric", StandardUnit.Count)

    val metricOne = DurationDataPoint(1000, None)
    val metricTwo = DurationDataPoint(1000, None)
    val metricThree = DurationDataPoint(1000, None)
    val metricFour = DurationDataPoint(1000, None)
    val allMetrics = List(metricOne, metricTwo, metricThree, metricFour)

    durationMetric.recordDuration(1000)
    durationMetric.recordDuration(1000)
    durationMetric.recordDuration(1000)
    List(metricOne, metricTwo, metricThree, metricFour).map(durationMetric.record)

    val dataPoints = durationMetric.getAndResetDataPoints
    dataPoints.length should be(7)
    dataPoints.splitAt(4)._1 should be(allMetrics)
  }
}
