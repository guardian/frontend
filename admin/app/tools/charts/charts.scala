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

  def form: String = "LineChart"

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

object AveragePageviewsByDayGraph extends Chart {
  val name = "Average pageviews per user (by day)"
  lazy val labels = Seq("Date", "pageviews")

  def dataset = Analytics.averagePageviewsByDay() map {
    case (date, total) => DataPoint(date.toString("dd/MM"), Seq(total))
  }
}

object ReturnUsersByDayGraph extends Chart {
  val name = "Return users (by day)"
  lazy val labels = Seq("Date", "users")

  def dataset = Analytics.returnUsersByDay() map {
    case (date, total) => DataPoint(date.toString("dd/MM"), Seq(total))
  }
}

object PageviewsGraph extends Chart {
  val name = "Pageviews"
  lazy val labels = Seq("Date", "pageviews")

  def dataset = Analytics.pageviews() map {
    case (date, total) => DataPoint(date.toString("dd/MM"), Seq(total))
  }
}

object NewPageviewsGraph extends Chart {
  val name = "Pageviews (new users)"
  lazy val labels = Seq("Date", "pageviews")

  def dataset = Analytics.newCookies() map {
    case (date, total) => DataPoint(date.toString("dd/MM"), Seq(total))
  }
}

object PageviewsGeoGraph extends Chart {
  val name = "Pageviews"
  lazy val labels = Seq("Country", "pageviews")

  override lazy val form: String = "GeoChart"

  def dataset = Analytics.countries() map {
    case (country, total) => DataPoint(country, Seq(total))
  }
}

object PageviewsOSTreeMapGraph extends Chart {
  val name = ""

  override lazy val form: String = "TreeMap"

  lazy val labels = Seq("OS", "pageviews")
  def dataset = Analytics.operatingSystems() map {
    case (os, total) => DataPoint(os, Seq(total))
  }

  override def asDataset = s"[[$labelString], [$rootElement], $dataString]"
  private def labelString = "'OS','parent','pageviews'"
  private def rootElement = "'Operating System', null, 0"

  private def dataString = dataset.map(datapointString).mkString(",")
  private def datapointString(point: DataPoint) = {
    val data = point.values.mkString(",")
    s"['${point.name}', 'Operating System', $data]"
  }
}

object PageviewsBrowsersTreeMapGraph extends Chart {
  val name = ""

  override lazy val form: String = "TreeMap"

  lazy val labels = Seq("Browsers", "pageviews")
  def dataset = Analytics.browsers() map {
    case (browser, total) => DataPoint(browser, Seq(total))
  }

  override def asDataset = s"[[$labelString], [$rootElement], $dataString]"
  private def labelString = "'Browser','parent','pageviews'"
  private def rootElement = "'Browser', null, 0"

  private def dataString = dataset.map(datapointString).mkString(",")
  private def datapointString(point: DataPoint) = {
    val data = point.values.mkString(",")
    s"['${point.name}', 'Browser', $data]"
  }
}
