package metrics

import akka.agent.Agent
import com.amazonaws.services.cloudwatch.model.{Dimension, StandardUnit, MetricDatum, PutMetricDataRequest}
import common.AkkaAgent
import model.diagnostics.CloudWatch
import scala.collection.JavaConversions._
import org.joda.time.DateTime

trait DataPoint {
  val value: Long
  val time: Option[DateTime]
}

case class DurationDataPoint(value: Long, time: Option[DateTime] = None) extends DataPoint

trait FrontendMetric {
  val name: String
  val metricUnit: StandardUnit
  def getDataPoints: List[DurationDataPoint]
}

case class DurationMetric(name: String, metricUnit: StandardUnit) extends FrontendMetric {

  private val dataPoints: Agent[List[DurationDataPoint]] = AkkaAgent(List[DurationDataPoint]())

  def getDataPoints: List[DurationDataPoint] = dataPoints.get()

  def record(dataPoint: DurationDataPoint) = dataPoints.alter(dataPoint :: _)

  def recordDuration(timeInMillis: Long) = record(DurationDataPoint(timeInMillis, Option(DateTime.now)))

}

object CloudWatchMetrics {
  def putMetrics(metrics: List[FrontendMetric], dimensions: List[Dimension]): Unit = {
    for {
      metric <- metrics
      dataPoints <- metric.getDataPoints.grouped(20)
      dataPoint <- dataPoints
    } {
      val request = new PutMetricDataRequest()
        .withNamespace("Application")
        .withMetricData {
          val metricDatum = new MetricDatum()
            .withValue(dataPoint.value)
            .withUnit(metric.metricUnit)
            .withMetricName(metric.name)
            .withDimensions(dimensions)

          dataPoint.time.fold(metricDatum) { t => metricDatum.withTimestamp(t.toDate)}
        }

      CloudWatch.cloudwatch.putMetricDataAsync(request)
    }
  }
}

object UkPressLatencyMetric extends DurationMetric("uk-press-latency", StandardUnit.Milliseconds)
object UsPressLatencyMetric extends DurationMetric("us-press-latency", StandardUnit.Milliseconds)
object AuPressLatencyMetric extends DurationMetric("au-press-latency", StandardUnit.Milliseconds)

object AllFrontsPressLatencyMetric extends DurationMetric("front-press-latency", StandardUnit.Milliseconds)

object LatencyMetrics {
  val all: List[DurationMetric] = List(UkPressLatencyMetric, UsPressLatencyMetric, AuPressLatencyMetric,
    AllFrontsPressLatencyMetric)
}