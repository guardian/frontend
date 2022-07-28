package metrics

import com.amazonaws.services.cloudwatch.model.StandardUnit
import org.scalatest.matchers.should.Matchers
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec

class DurationMetricTest extends AnyFlatSpec with Matchers {

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

  "SamplerMetric" should "start off empty" in {
    val samplerMetric: SamplerMetric = SamplerMetric("TestMetric", StandardUnit.Count)

    samplerMetric.getAndResetDataPoints should be(List())
  }

  it should "record some samples" in {
    val samplerMetric: SamplerMetric = SamplerMetric("TestMetric", StandardUnit.Count)

    samplerMetric.recordSample(1000, DateTime.now())
    samplerMetric.recordSample(1000, DateTime.now())
    samplerMetric.recordSample(1000, DateTime.now())

    val storedDatapoints = samplerMetric.getAndResetDataPoints

    storedDatapoints.length should be(3)
    storedDatapoints.forall(_.value == 1000) should be(true)

    samplerMetric.getAndResetDataPoints.length should be(0)
  }

  it should "add recorded samples to the head of the list" in {
    val samplerMetric: SamplerMetric = SamplerMetric("TestMetric", StandardUnit.Count)

    val sampleOne = SampledDataPoint(10.00, DateTime.now())
    val sampleTwo = SampledDataPoint(11.00, DateTime.now())
    val sampleThree = SampledDataPoint(12.00, DateTime.now())
    val sampleFour = SampledDataPoint(13.00, DateTime.now())
    val allSamples = List(sampleOne, sampleTwo, sampleThree, sampleFour)

    samplerMetric.recordSample(10.00, DateTime.now())
    samplerMetric.recordSample(10.00, DateTime.now())
    samplerMetric.recordSample(10.00, DateTime.now())
    allSamples.map((sample) => samplerMetric.recordSample(sample.value, sample.sampleTime))

    val samples = samplerMetric.getAndResetDataPoints
    samples.length should be(7)
    samples.splitAt(4)._1 should be(allSamples.reverse)
  }
}
