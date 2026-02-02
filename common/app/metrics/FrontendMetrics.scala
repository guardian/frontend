package metrics

import common.{Box, StopWatch}
import software.amazon.awssdk.services.cloudwatch.model.StandardUnit

import java.time.Instant
import java.util.concurrent.TimeUnit.MILLISECONDS
import java.util.concurrent.atomic.AtomicLong
import scala.concurrent.Future
import scala.util.Try

sealed trait DataPoint {
  val value: Double
  val time: Option[Instant]
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

case class SimpleDataPoint(value: Double, sampleTime: Instant) extends DataPoint {
  override val time = Some(sampleTime)
}

final case class SimpleMetric(override val name: String, datapoint: SimpleDataPoint) extends FrontendMetric {
  override val metricUnit: StandardUnit = StandardUnit.COUNT
  override val getAndResetDataPoints: List[DataPoint] = List(datapoint)
  override val isEmpty = false
}

case class TimingDataPoint(value: Double, time: Option[Instant] = None) extends DataPoint

final case class TimingMetric(override val name: String, description: String) extends FrontendMetric {

  override val metricUnit: StandardUnit = StandardUnit.MILLISECONDS

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

case class GaugeDataPoint(value: Double, time: Option[Instant] = None) extends DataPoint

final case class GaugeMetric(
    override val name: String,
    description: String,
    override val metricUnit: StandardUnit = StandardUnit.MEGABYTES,
    get: () => Double,
) extends FrontendMetric {

  override def getAndResetDataPoints: List[DataPoint] = List(GaugeDataPoint(get()))
  override def isEmpty: Boolean = false
}

case class CountDataPoint(value: Double, time: Option[Instant] = None) extends DataPoint

final case class CountMetric(override val name: String, description: String) extends FrontendMetric {
  private val count: AtomicLong = new AtomicLong(0L)
  override val metricUnit = StandardUnit.COUNT

  override def getAndResetDataPoints: List[DataPoint] = List(CountDataPoint(count.getAndSet(0L).toDouble))

  override def isEmpty: Boolean = count.get() == 0L

  def increment(): Unit = count.incrementAndGet()
  def add(value: Long): Unit = count.addAndGet(value)
}

case class DurationDataPoint(value: Double, time: Option[Instant] = None) extends DataPoint

final case class DurationMetric(override val name: String, override val metricUnit: StandardUnit)
    extends FrontendMetric {

  private val dataPoints: Box[List[DataPoint]] = Box(List[DurationDataPoint]())

  override def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  // Public for tests.
  def record(dataPoint: DurationDataPoint): Unit = dataPoints.alter(dataPoint :: _)

  def recordDuration(timeInMillis: Double): Unit = record(DurationDataPoint(timeInMillis, Option(Instant.now)))
  def recordDuration(duration: java.time.Duration): Unit =
    recordDuration(duration.toNanos.toDouble / MILLISECONDS.toNanos(1))

  override def isEmpty: Boolean = dataPoints.get().isEmpty
}

object DurationMetric {
  def withMetrics[A](metric: DurationMetric)(block: => A): A = {
    val stopWatch: StopWatch = new StopWatch
    val result = block
    metric.recordDuration(stopWatch.elapsed.toDouble)
    result
  }
}

case class SampledDataPoint(value: Double, sampleTime: Instant) extends DataPoint {
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

  def recordSample(sampleValue: Double, sampleTime: Instant): Future[List[SampledDataPoint]] =
    dataPoints.alter(SampledDataPoint(sampleValue, sampleTime) :: _)

  override def isEmpty: Boolean = dataPoints.get().isEmpty
}
