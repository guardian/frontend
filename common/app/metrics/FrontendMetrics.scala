package metrics

import java.util.concurrent.atomic.AtomicLong

import com.amazonaws.services.cloudwatch.model.StandardUnit
import common.{Box, StopWatch}
import model.diagnostics.CloudWatch
import org.joda.time.DateTime
import scala.concurrent.Future
import scala.util.Try

sealed trait DataPoint {
  val value: Double
  val time: Option[DateTime]
}

sealed trait FrontendMetric {
  val name: String
  val metricUnit: StandardUnit
  def getAndResetDataPoints: List[DataPoint]
  def isEmpty: Boolean
}

case class FrontendStatisticSet(datapoints: List[DataPoint], name: String, unit: StandardUnit) {

  lazy val sampleCount: Double = datapoints.size
  lazy val maximum: Double = Try(datapoints.maxBy(_.value).value).getOrElse(0.0d)
  lazy val minimum: Double = Try(datapoints.minBy(_.value).value).getOrElse(0.0d)
  lazy val sum: Double = datapoints.map(_.value).sum
  lazy val average: Double =
    Try(sum / sampleCount).toOption.getOrElse(0L)
}

case class SimpleDataPoint(value: Double, sampleTime: DateTime) extends DataPoint {
  override val time = Some(sampleTime)
}

final case class SimpleMetric(override val name: String, datapoint: SimpleDataPoint) extends FrontendMetric {
  override val metricUnit: StandardUnit = StandardUnit.Count
  override val getAndResetDataPoints: List[DataPoint] = List(datapoint)
  override val isEmpty = false
}

// MetricUploader is a class to allow basic putting of metrics. Why does it exist? Because if we provide
// access to cloudwatch directly, then we start to measure everything, and never remove unused metrics.
// Also, MetricUploader will upload in batches.
final case class MetricUploader(namespace: String) {

  private val datapoints: Box[List[SimpleMetric]] = Box(List.empty)

  def put(metrics: Map[String, Double]): Unit = {
    val timedMetrics = metrics.map {
      case (key, value) =>
        SimpleMetric(name = key, SimpleDataPoint(value, DateTime.now))
    }
    datapoints.send(_ ++ timedMetrics)
  }

  def upload(): Unit = {
    val points = datapoints.get()
    datapoints.alter(_.diff(points))
    CloudWatch.putMetrics(namespace, points, List.empty)
  }
}

case class TimingDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

final case class TimingMetric(override val name: String, description: String) extends FrontendMetric {

  override val metricUnit: StandardUnit = StandardUnit.Milliseconds

  private val timeInMillis = new AtomicLong()
  private val currentCount = new AtomicLong()

  def recordDuration(durationInMillis: Long): Unit = {
    timeInMillis.addAndGet(durationInMillis)
    currentCount.incrementAndGet()
  }

  override def getAndResetDataPoints: List[DataPoint] =
    List(
      TimingDataPoint(Try {
        timeInMillis.getAndSet(0L).toDouble / currentCount.getAndSet(0L).toDouble
      }.getOrElse(0.0d)),
    )
  override def isEmpty: Boolean = currentCount.get() == 0L
}

case class GaugeDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

final case class GaugeMetric(
    override val name: String,
    description: String,
    override val metricUnit: StandardUnit = StandardUnit.Megabytes,
    get: () => Double,
) extends FrontendMetric {

  override def getAndResetDataPoints: List[DataPoint] = List(GaugeDataPoint(get()))
  override def isEmpty: Boolean = false
}

case class CountDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

final case class CountMetric(override val name: String, description: String) extends FrontendMetric {
  private val count: AtomicLong = new AtomicLong(0L)
  override val metricUnit = StandardUnit.Count

  override def getAndResetDataPoints: List[DataPoint] = List(CountDataPoint(count.getAndSet(0L).toDouble))

  override def isEmpty: Boolean = count.get() == 0L

  def increment(): Unit = count.incrementAndGet()
  def add(value: Long): Unit = count.addAndGet(value)
}

case class DurationDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

final case class DurationMetric(override val name: String, override val metricUnit: StandardUnit)
    extends FrontendMetric {

  private val dataPoints: Box[List[DataPoint]] = Box(List[DurationDataPoint]())

  override def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  // Public for tests.
  def record(dataPoint: DurationDataPoint): Unit = dataPoints.alter(dataPoint :: dataPoints.get())

  def recordDuration(timeInMillis: Double): Unit = record(DurationDataPoint(timeInMillis, Option(DateTime.now)))

  override def isEmpty: Boolean = dataPoints.get().isEmpty
}

object DurationMetric {
  def withMetrics[A](metric: DurationMetric)(block: => A): A = {
    val stopWatch: StopWatch = new StopWatch
    val result = block
    metric.recordDuration(stopWatch.elapsed)
    result
  }
}

case class SampledDataPoint(value: Double, sampleTime: DateTime) extends DataPoint {
  override val time = Some(sampleTime)
}

final case class SamplerMetric(override val name: String, override val metricUnit: StandardUnit)
    extends FrontendMetric {

  private val dataPoints: Box[List[SampledDataPoint]] = Box(List[SampledDataPoint]())

  override def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  def recordSample(sampleValue: Double, sampleTime: DateTime): Future[List[SampledDataPoint]] =
    dataPoints.alter(SampledDataPoint(sampleValue, sampleTime) :: dataPoints.get())

  override def isEmpty: Boolean = dataPoints.get().isEmpty
}
