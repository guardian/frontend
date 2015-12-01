package metrics

import java.util.concurrent.atomic.AtomicLong

import akka.agent.Agent
import com.amazonaws.services.cloudwatch.model.StandardUnit
import common.AkkaAgent
import org.joda.time.DateTime
import scala.concurrent.Future
import scala.util.Try

sealed trait DataPoint {
  val value: Long
  val time: Option[DateTime]
}

case class DurationDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

case class CountDataPoint(value: Long) extends DataPoint {
  val time: Option[DateTime] = None
}

case class GaugeDataPoint(value: Long) extends DataPoint {
  val time: Option[DateTime] = None
}

case class FrontendStatisticSet(metric: FrontendMetric, datapoints: List[DataPoint]) {
  lazy val sampleCount: Double = datapoints.size
  lazy val maximum: Double = Try(datapoints.maxBy(_.value).value).getOrElse(0L).toDouble
  lazy val minimum: Double = Try(datapoints.minBy(_.value).value).getOrElse(0L).toDouble
  lazy val sum: Double = datapoints.map(_.value).sum
  lazy val average: Double =
    Try(sum / sampleCount).toOption.getOrElse(0L)

  def reset(): Unit = metric.putDataPoints(datapoints)
}

sealed trait FrontendMetric {
  val name: String
  val metricUnit: StandardUnit
  def getAndResetDataPoints: List[DataPoint]
  def putDataPoints(points: List[DataPoint]): Unit
  def isEmpty: Boolean
}

case class FrontendTimingMetric(name: String, description: String) extends FrontendMetric {

  val metricUnit: StandardUnit = StandardUnit.Milliseconds

  private val timeInMillis = new AtomicLong()
  private val currentCount = new AtomicLong()

  def recordDuration(durationInMillis: Long): Unit = {
    timeInMillis.addAndGet(durationInMillis)
    currentCount.incrementAndGet
  }

  def getAndResetDataPoints: List[DataPoint] = List(DurationDataPoint(Try(timeInMillis.getAndSet(0) / currentCount.getAndSet(0)).getOrElse(0L)))
  def getAndReset: Long = getAndResetDataPoints.map(_.value).reduce(_ + _)

  def putDataPoints(points: List[DataPoint]): Unit = points.map(_.value).map(recordDuration)

  def isEmpty: Boolean = currentCount.get() == 0L

  def getCount: Long = currentCount.get()
}

case class GaugeMetric(name: String, description: String, get: () => Long, metricUnit: StandardUnit = StandardUnit.Megabytes) extends FrontendMetric {
  def getAndResetDataPoints: List[DataPoint] = List(GaugeDataPoint(get()))
  def putDataPoints(points: List[DataPoint]): Unit = ()
  def isEmpty: Boolean = false
}

case class CountMetric(name: String, description: String) extends FrontendMetric {
  private val count: AtomicLong = new AtomicLong(0L)
  val metricUnit = StandardUnit.Count

  def getAndResetDataPoints: List[DataPoint] = List(CountDataPoint(count.getAndSet(0L)))
  def getAndReset: Long = getAndResetDataPoints.map(_.value).reduce(_ + _)
  def putDataPoints(points: List[DataPoint]): Unit = for(dataPoint <- points) count.addAndGet(dataPoint.value)

  def getResettingValue(): Long = count.get()

  def record(): Unit = count.incrementAndGet()
  def increment(): Unit = record()
  def isEmpty: Boolean = count.get() == 0L
}

case class DurationMetric(name: String, metricUnit: StandardUnit) extends FrontendMetric {

  private val dataPoints: Agent[List[DataPoint]] = AkkaAgent(List[DurationDataPoint]())

  def getDataPoints: List[DataPoint] = dataPoints.get()

  def getDataFuture: Future[List[DataPoint]] = dataPoints.future()

  def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  def putDataPoints(points: List[DataPoint]): Unit = dataPoints.alter(points ::: _)

  def record(dataPoint: DurationDataPoint): Unit = dataPoints.alter(dataPoint :: _)

  def recordDuration(timeInMillis: Long): Unit = record(DurationDataPoint(timeInMillis, Option(DateTime.now)))
  def isEmpty: Boolean = dataPoints.get().isEmpty
}

object UkPressLatencyMetric extends DurationMetric("uk-press-latency", StandardUnit.Milliseconds)
object UsPressLatencyMetric extends DurationMetric("us-press-latency", StandardUnit.Milliseconds)
object AuPressLatencyMetric extends DurationMetric("au-press-latency", StandardUnit.Milliseconds)

object AllFrontsPressLatencyMetric extends DurationMetric("front-press-latency", StandardUnit.Milliseconds)

object EmailSubsciptionMetrics {
  object EmailSubmission extends CountMetric("email-submission", "Successful POST to the email API Gateway")
  object APIHTTPError extends CountMetric("email-api-http-error", "Non-200/201 response from email subscription API")
  object APINetworkError extends CountMetric("email-api-network-error", "Email subscription API network failure")
  object ListIDError extends CountMetric("email-list-id-error", "Invalid list ID in email subscription")
}
