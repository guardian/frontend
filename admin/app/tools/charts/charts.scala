package tools

import java.util.concurrent.Future
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsResult
import java.util.UUID
import collection.JavaConversions._
import org.joda.time.DateTime


case class DataPoint(name: String, values: Seq[Double])

trait Chart {

  //used in html as element id
  lazy val id = UUID.randomUUID().toString

  def name: String
  def yAxis: Option[String] = None
  def labels: Seq[String]
  def dataset: Seq[DataPoint]

  def asDataset = s"[[$labelString], $dataString]"

  private def labelString = labels.map(l => s"'$l'").mkString(",")
  private def datapointString(point: DataPoint) = {
    val data = point.values.mkString(",")
    s"['${point.name}', $data]"
  }
  private def dataString = dataset.map(datapointString).mkString(",")
}

case class LatencyGraph(name: String, private val metrics: Future[GetMetricStatisticsResult]) extends Chart {

  lazy val labels = Seq("Time", "avg. ms")

  override lazy val yAxis = Some("latency (ms)")

  private lazy val datapoints = metrics.get().getDatapoints.sortBy(_.getTimestamp.getTime).toSeq

  lazy val dataset = datapoints.map(d => DataPoint(
    new DateTime(d.getTimestamp.getTime).toString("HH:mm"),
    Seq(d.getAverage * 1000)
    )
  )
}


case class Request2xxGraph(name: String, private val metrics: Future[GetMetricStatisticsResult]) extends Chart {

  lazy val labels = Seq("Time", "count")

  override lazy val yAxis = Some("2xx requests/min")

  private lazy val datapoints = metrics.get().getDatapoints.sortBy(_.getTimestamp.getTime).toSeq

  lazy val dataset = datapoints.map(d => DataPoint(
    new DateTime(d.getTimestamp.getTime).toString("HH:mm"),
    Seq(d.getSum)
  )
  )
}


