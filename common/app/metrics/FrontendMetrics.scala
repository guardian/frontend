package metrics

import java.util.concurrent.atomic.AtomicLong

import akka.agent.Agent
import com.amazonaws.services.cloudwatch.model.StandardUnit
import common.AkkaAgent
import org.joda.time.DateTime
import scala.util.Try

sealed trait DataPoint {
  val value: Long
  val time: Option[DateTime]
}

sealed trait FrontendMetric {
  val name: String
  val metricUnit: StandardUnit
  def getAndResetDataPoints: List[DataPoint]
  def isEmpty: Boolean
}

case class FrontendStatisticSet(
  datapoints: List[DataPoint],
  name: String,
  unit: StandardUnit) {

  lazy val sampleCount: Double = datapoints.size
  lazy val maximum: Double = Try(datapoints.maxBy(_.value).value).getOrElse(0L).toDouble
  lazy val minimum: Double = Try(datapoints.minBy(_.value).value).getOrElse(0L).toDouble
  lazy val sum: Double = datapoints.map(_.value).sum
  lazy val average: Double =
    Try(sum / sampleCount).toOption.getOrElse(0L)
}

case class TimingDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

case class TimingMetric(override val name: String, description: String) extends FrontendMetric {

  override val metricUnit: StandardUnit = StandardUnit.Milliseconds

  private val timeInMillis = new AtomicLong()
  private val currentCount = new AtomicLong()

  def recordDuration(durationInMillis: Long): Unit = {
    timeInMillis.addAndGet(durationInMillis)
    currentCount.incrementAndGet
  }

  override def getAndResetDataPoints: List[DataPoint] = List(TimingDataPoint(Try(timeInMillis.getAndSet(0) / currentCount.getAndSet(0)).getOrElse(0L)))
  override def isEmpty: Boolean = currentCount.get() == 0L
}

case class GaugeDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

case class GaugeMetric(
  override val name: String,
  description: String,
  override val metricUnit: StandardUnit = StandardUnit.Megabytes,
  get: () => Long) extends FrontendMetric {

  override def getAndResetDataPoints: List[DataPoint] = List(GaugeDataPoint(get()))
  override def isEmpty: Boolean = false
}

case class CountDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

case class CountMetric(override val name: String, description: String) extends FrontendMetric {
  private val count: AtomicLong = new AtomicLong(0L)
  override val metricUnit = StandardUnit.Count

  override def getAndResetDataPoints: List[DataPoint] = List(CountDataPoint(count.getAndSet(0L)))

  override def isEmpty: Boolean = count.get() == 0L

  def record(): Unit = count.incrementAndGet()
  def increment(): Unit = record()
}

case class DurationDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

case class DurationMetric(override val name: String, override val metricUnit: StandardUnit) extends FrontendMetric {

  private val dataPoints: Agent[List[DataPoint]] = AkkaAgent(List[DurationDataPoint]())

  override def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  private def record(dataPoint: DurationDataPoint): Unit = dataPoints.alter(dataPoint :: _)

  def recordDuration(timeInMillis: Long): Unit = record(DurationDataPoint(timeInMillis, Option(DateTime.now)))

  override def isEmpty: Boolean = dataPoints.get().isEmpty
}
