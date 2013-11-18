package tools

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

case class MaximumMetric(metric: Future[GetMetricStatisticsResult]) {
  lazy val max: Double = metric.get().getDatapoints.headOption.map(_.getMaximum.doubleValue()).getOrElse(0.0)
}

case class ChartFormat(colours: Seq[String], cssClass: String)

object ChartFormat {
  val SingleLineBlack = ChartFormat(colours = Seq("#000000"), cssClass = "charts")
  val SingleLineBlue = ChartFormat(colours = Seq("#0033CC"), cssClass = "charts")
  val SingleLineGreen = ChartFormat(colours = Seq("#00CC33"), cssClass =  "charts")
  val SingleLineRed = ChartFormat(colours = Seq("#FF0000"), cssClass =  "charts")
  val DoubleLineBlueRed = ChartFormat(colours = Seq("#0033CC", "#FF0000"), cssClass =  "charts")
  val MultiLine = ChartFormat(colours = Seq("#00A67C", "#1B1BB3", "#FF00FF", "#FFFF00", "#0033CC", "#FF0000"), cssClass =  "charts")
}

class LineChart(val name: String, val labels: Seq[String], charts: Future[GetMetricStatisticsResult]*) extends Chart {

  override lazy val dataset = {
    val allPoints: List[List[(String, Double)]] = charts.toList.map(_.get())
      .map(_.getDatapoints.toList.sortBy(_.getTimestamp.getTime))
      .map(p => p.map(d => toLabel(d) -> toValue(d)))

    allPoints match {
      case head :: Nil => head.map{ case (key, value) => DataPoint(key, Seq(value)) }
      // yeah, this assumes all keys match up
      case head :: tail => head.map{ case (key, value) => DataPoint(key, Seq(value) ++ tail.flatten.find(_._1 == key).map(_._2)) }
      case _ => Nil
    }
  }
    
  def toValue(dataPoint: Datapoint): Double = Option(dataPoint.getAverage).orElse(Option(dataPoint.getSum))
      .getOrElse(throw new IllegalStateException(s"Don't know how to get a value for $dataPoint"))

  def toLabel(dataPoint: Datapoint): String = new DateTime(dataPoint.getTimestamp.getTime).toString("HH:mm")

  lazy val hasData = dataset.nonEmpty

  lazy val latest = dataset.lastOption.flatMap(_.values.headOption).getOrElse(0.0)

  lazy val format = ChartFormat.SingleLineBlue

  def withFormat(f: ChartFormat) = new LineChart(name, labels, charts:_*) {
    override lazy val format = f
  }
}
