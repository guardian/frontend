package metrics

import akka.agent.Agent
import com.amazonaws.services.cloudwatch.model.StandardUnit
import common.AkkaAgent
import org.joda.time.DateTime
import scala.concurrent.Future

sealed trait DataPoint {
  val value: Long
  val time: Option[DateTime]
}

case class DurationDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

trait FrontendMetric {
  val name: String
  val metricUnit: StandardUnit
  def getAndResetDataPoints: List[DataPoint]
  def putDataPoints(points: List[DataPoint]): Future[List[DataPoint]]
}

case class DurationMetric(name: String, metricUnit: StandardUnit) extends FrontendMetric {

  private val dataPoints: Agent[List[DataPoint]] = AkkaAgent(List[DurationDataPoint]())

  def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  def putDataPoints(points: List[DataPoint]): Future[List[DataPoint]] = dataPoints.alter(_ ::: points)

  def record(dataPoint: DurationDataPoint): Unit = dataPoints.alter(dataPoint :: _)

  def recordDuration(timeInMillis: Long): Unit = record(DurationDataPoint(timeInMillis, Option(DateTime.now)))
}

object UkPressLatencyMetric extends DurationMetric("uk-press-latency", StandardUnit.Milliseconds)
object UsPressLatencyMetric extends DurationMetric("us-press-latency", StandardUnit.Milliseconds)
object AuPressLatencyMetric extends DurationMetric("au-press-latency", StandardUnit.Milliseconds)

object AllFrontsPressLatencyMetric extends DurationMetric("front-press-latency", StandardUnit.Milliseconds)

object LatencyMetrics {
  val all: List[DurationMetric] = List(UkPressLatencyMetric, UsPressLatencyMetric, AuPressLatencyMetric,
    AllFrontsPressLatencyMetric)
}