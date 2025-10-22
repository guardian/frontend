package metrics

import common.Box
import org.joda.time.DateTime
import software.amazon.awssdk.services.cloudwatch.model.{StandardUnit => StandardUnitV2}

import scala.concurrent.Future
import scala.util.Try


sealed trait FrontendMetricV2 {
  val name: String
  val metricUnit: StandardUnitV2
  def getAndResetDataPoints: List[DataPoint]
  def isEmpty: Boolean
}

case class FrontendStatisticSetV2(datapoints: List[DataPoint], name: String, unit: StandardUnitV2) {

  lazy val sampleCount: Double = datapoints.size
  lazy val maximum: Double = Try(datapoints.maxBy(_.value).value).getOrElse(0.0d)
  lazy val minimum: Double = Try(datapoints.minBy(_.value).value).getOrElse(0.0d)
  lazy val sum: Double = datapoints.map(_.value).sum
  lazy val average: Double =
    Try(sum / sampleCount).toOption.getOrElse(0L)
}

final case class SamplerMetricV2(override val name: String, override val metricUnit: StandardUnitV2)
  extends FrontendMetricV2 {

  private val dataPoints: Box[List[SampledDataPoint]] = Box(List[SampledDataPoint]())

  override def getAndResetDataPoints: List[DataPoint] = {
    val points = dataPoints.get()
    dataPoints.alter(_.diff(points))
    points
  }

  def recordSample(sampleValue: Double, sampleTime: DateTime): Future[List[SampledDataPoint]] =
    dataPoints.alter(SampledDataPoint(sampleValue, sampleTime) :: _)

  override def isEmpty: Boolean = dataPoints.get().isEmpty
}
