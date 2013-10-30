package tools

import collection.immutable.LongMap
import com.amazonaws.services.cloudwatch.model.{GetMetricStatisticsResult, Datapoint}
import java.util.concurrent.Future
import java.util.{UUID, Date}
import org.joda.time.DateTime
import scala.collection.JavaConversions._

case class DataPoint(name: String, values: Seq[Double]) {

  def this(date: Date, values: Seq[Double]) =
  {
    this((new DateTime(date.getTime)).toString("HH:mm"), values)
  }
}

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

object PageviewsByDayGraph extends Chart with implicits.Tuples with implicits.Dates {
  val name = "Pageviews"
  lazy val labels = Seq("Date", "pageviews")

  def dataset = Analytics.getPageviewsByDay().toList sortBy { _.first } map {
    case (date, total) => DataPoint(date.toString("dd/MM"), Seq(total))
  }
}

object NewPageviewsByDayGraph extends Chart with implicits.Tuples with implicits.Dates{
  val name = "Pageviews (new users)"
  lazy val labels = Seq("Date", "pageviews")

  def dataset = Analytics.getNewPageviewsByDay().toList sortBy { _.first } map {
    case (date, total) => DataPoint(date.toString("dd/MM"), Seq(total))
  }
}

object PageviewsByCountryGeoGraph extends Chart {
  val name = "Pageviews"
  lazy val labels = Seq("Country", "pageviews")

  override lazy val form: String = "GeoChart"

  def dataset = Analytics.getPageviewsByCountry().toList map {
    case (country, total) => DataPoint(country, Seq(total))
  }
}

object PageviewsByOperatingSystemTreeMapGraph extends Chart {
  val name = ""

  override lazy val form: String = "TreeMap"

  lazy val labels = Seq("OS", "pageviews")
  def dataset = Analytics.getPageviewsByOperatingSystem().toList map {
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

object PageviewsByBrowserTreeMapGraph extends Chart {
  val name = ""

  override lazy val form: String = "TreeMap"

  lazy val labels = Seq("Browsers", "pageviews")
  def dataset = Analytics.getPageviewsByBrowser().toList map {
    case (browser, total) => DataPoint(browser, Seq(total))
  }

  override def asDataset = s"[[$labelString], [$rootElement], $dataString]"
  private def labelString = "'Browser','parent','getPageviewsByDay'"
  private def rootElement = "'Browser', null, 0"

  private def dataString = dataset.map(datapointString).mkString(",")
  private def datapointString(point: DataPoint) = {
    val data = point.values.mkString(",")
    s"['${point.name}', 'Browser', $data]"
  }
}

object PageviewsPerUserGraph extends Chart with implicits.Tuples with implicits.Dates {
  val name = "Average pageviews per user (daily/weekly/4 weekly)"
  lazy val labels = Seq("Date", "day", "week", "4 week")

  def dataset = {
    val day = Analytics.getPageviewsPerUserByDay() withDefaultValue 0.0
    val week = Analytics.getWeeklyPageviewsPerUserByDay() withDefaultValue 0.0
    val month = Analytics.getFourWeeklyPageviewsPerUserByDay() withDefaultValue 0.0

    val range = (day.keySet ++ week.keySet ++ month.keySet - today()).toList.sorted
    range map { date =>
      DataPoint(date.toString("dd/MM"), Seq(day(date), week(date), month(date)))
    }
  }
}

object ReturnUsersPercentageByDayGraph extends Chart with implicits.Tuples with implicits.Dates {
  val name = "Return users % (daily/weekly/4 weekly)"
  lazy val labels = Seq("Date", "day", "week", "4 week")

  def dataset = {
    val users = Analytics.getUsersByDay() mapValues { _ max 1L }

    val day = Analytics.getReturnUsersByDay() withDefaultValue 0L
    val week = Analytics.getWeeklyReturnUsersByDay() withDefaultValue 0L
    val month = Analytics.getFourWeeklyReturnUsersByDay() withDefaultValue 0L

    val range = (day.keySet ++ week.keySet ++ month.keySet - today()).toList.sorted
    range map { date =>
      val totalUsers = users(date) / 100.0
      DataPoint(date.toString("dd/MM"), Seq(day(date)/totalUsers, week(date)/totalUsers, month(date)/totalUsers))
    }
  }
}

object DaysSeenPerUserGraph extends Chart with implicits.Tuples with implicits.Dates {
  val name = "Average days seen per user  (weekly/4 weekly)"
  lazy val labels = Seq("Date", "week", "4 week")

  def dataset = {
    val week = Analytics.getWeeklyDaysSeenPerUserByDay() withDefaultValue 0.0
    val month = Analytics.getFourWeeklyDaysSeenPerUserByDay() withDefaultValue 0.0

    val range = (week.keySet ++ month.keySet - today()).toList.sorted
    range map { date =>
      DataPoint(date.toString("dd/MM"), Seq(week(date), month(date)))
    }
  }
}

object ActiveUsersFourDaysFromSevenOrMoreGraph extends Chart with implicits.Tuples with implicits.Dates {
  val name = "Users active 4 or more days (weekly/4 weekly)"
  lazy val labels = Seq("Date", "week", "4 week")

  def dataset = {
    val week = {
      val users = Analytics.getWeeklyDaysSeenByDay()
      val counts = (users filterKeys { _ >= 4 }).values flatMap { _.toList }
      val grouped = counts groupBy { _.first } mapValues { _ map { _.second }}
      val summed = grouped mapValues { _.sum }
      summed withDefaultValue 0L
    }
    val month = {
      val users = Analytics.getFourWeeklyDaysSeenByDay()
      val counts = (users filterKeys { _ >= 4 }).values flatMap { _.toList }
      val grouped = counts groupBy { _.first } mapValues { _ map { _.second }}
      val summed = grouped mapValues { _.sum }
      summed withDefaultValue 0L
    }

    val range = (week.keySet ++ month.keySet - today()).toList.sorted
    range map { date =>
      DataPoint(date.toString("dd/MM"), Seq(week(date), month(date)))
    }
  }
}

object ActiveUserProportionGraph extends Chart with implicits.Tuples with implicits.Dates {
  val name = "Active users as a percentage of monthly active users (daily/weekly)"
  lazy val labels = Seq("Date", "day", "week")

  def dataset = {
    val day = Analytics.getUsersByDay() withDefaultValue 0L
    val week = Analytics.getWeeklyUsersByDay() withDefaultValue 0L
    val month = Analytics.getFourWeeklyUsersByDay() mapValues { _ max 1L }

    val range = (day.keySet ++ week.keySet ++ month.keySet - today()).toList.sorted
    range map { date =>
      val monthlyUsers = month(date) / 100.0
      DataPoint(date.toString("dd/MM"), Seq(day(date)/monthlyUsers, week(date)/monthlyUsers))
    }
  }
}

case class FastlyMetricGraph(
  name: String,
  metric: String,
  metricResults: Future[GetMetricStatisticsResult]) extends Chart {

  override lazy val labels = Seq("Time", metric)

  override lazy val yAxis = Some(metric)

  private lazy val datapoints = metricResults.get().getDatapoints.sortBy(_.getTimestamp.getTime).toSeq

  override lazy val dataset = datapoints.map(d => DataPoint(
    new DateTime(d.getTimestamp.getTime).toString("HH:mm"), Seq(d.getAverage))
  )
}

case class CostMetric(costMetric: Future[GetMetricStatisticsResult]) {
  lazy val cost = costMetric.get().getDatapoints.headOption.map(_.getMaximum.toInt).getOrElse(0)
}

case class FastlyHitMissGraph(
   name: String,
   hitResults: Future[GetMetricStatisticsResult],
   missResults: Future[GetMetricStatisticsResult]) extends Chart {

  override lazy val labels = Seq("'Time'", "'Hits'", "'Misses'")
  override lazy val yAxis = None
  override val dataset = Nil
  override def asDataset = s"[[$labelString], $dataString]"

  private def labelString = labels.mkString(",")
  private def dataString =  datapoints.keys.toList.sorted map { key:Long =>
    val points = datapoints(key)
    val data = points._1.values ++ points._2.values mkString(",")
    s"['${points._1.name}', $data]" } mkString(",")

  private lazy val datapoints:LongMap[(DataPoint, DataPoint)] = {
    val hitmap:LongMap[Datapoint] = LongMap(hitResults.get().getDatapoints.map {
      point => (point.getTimestamp.getTime, point)
    }.toSeq:_*)

    val missMap:LongMap[Datapoint] = LongMap(missResults.get().getDatapoints.map {
      point => (point.getTimestamp.getTime, point)
    }.toSeq:_*)

    // Merge both queries into a single Map, indexed by timestamp.
    hitmap.intersectionWith(missMap, (_, valueA:Datapoint, valueB:Datapoint) => {
      (new DataPoint(valueA.getTimestamp, Seq[Double](valueA.getAverage)),
       new DataPoint(valueB.getTimestamp, Seq[Double](valueB.getAverage)))
    })
  }
}