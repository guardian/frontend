package metrics

import java.util.concurrent.atomic.AtomicLong

import akka.agent.Agent
import com.amazonaws.services.cloudwatch.model.StandardUnit
import common.AkkaAgent
import org.joda.time.DateTime
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

case class FrontendStatisticSet(
  datapoints: List[DataPoint],
  name: String,
  unit: StandardUnit) {

  lazy val sampleCount: Double = datapoints.size
  lazy val maximum: Double = Try(datapoints.maxBy(_.value).value).getOrElse(0.0d)
  lazy val minimum: Double = Try(datapoints.minBy(_.value).value).getOrElse(0.0d)
  lazy val sum: Double = datapoints.map(_.value).sum
  lazy val average: Double =
    Try(sum / sampleCount).toOption.getOrElse(0L)
}

case class TimingDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

case class TimingMetric(override val name: String, description: String) extends FrontendMetric {

  override val metricUnit: StandardUnit = StandardUnit.Milliseconds

  private val timeInMillis = new AtomicLong()
  private val currentCount = new AtomicLong()

  def recordDuration(durationInMillis: Long): Unit = {
    timeInMillis.addAndGet(durationInMillis)
    currentCount.incrementAndGet()
  }

  override def getAndResetDataPoints: List[DataPoint] = List(
    TimingDataPoint(Try {
      timeInMillis.getAndSet(0L).toDouble / currentCount.getAndSet(0L).toDouble
    }.getOrElse(0.0d))
  )
  override def isEmpty: Boolean = currentCount.get() == 0L
}

case class GaugeDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

case class GaugeMetric(
  override val name: String,
  description: String,
  override val metricUnit: StandardUnit = StandardUnit.Megabytes,
  get: () => Double) extends FrontendMetric {

  override def getAndResetDataPoints: List[DataPoint] = List(GaugeDataPoint(get()))
  override def isEmpty: Boolean = false
}

case class CountDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

case class CountMetric(override val name: String, description: String) extends FrontendMetric {
  private val count: AtomicLong = new AtomicLong(0L)
  override val metricUnit = StandardUnit.Count

  override def getAndResetDataPoints: List[DataPoint] = List(CountDataPoint(count.getAndSet(0L).toDouble))

  override def isEmpty: Boolean = count.get() == 0L

  def increment(): Unit = count.incrementAndGet()
}

case class DurationDataPoint(value: Double, time: Option[DateTime] = None) extends DataPoint

case class DurationMetric(override val name: String, override val metricUnit: StandardUnit) extends FrontendMetric {

  private val dataPoints: Agent[List[DataPoint]] = AkkaAgent(List[DurationDataPoint]())

  override def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  private def record(dataPoint: DurationDataPoint): Unit = dataPoints.alter(dataPoint :: _)

  def recordDuration(timeInMillis: Double): Unit = record(DurationDataPoint(timeInMillis, Option(DateTime.now)))

  override def isEmpty: Boolean = dataPoints.get().isEmpty
}
