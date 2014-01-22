package tools

import com.amazonaws.services.cloudwatch.model.{GetMetricStatisticsResult, Datapoint}
import java.util.concurrent.Future
import java.util.{UUID, Date}
import org.joda.time.DateTime
import scala.collection.JavaConversions._
import scala.collection.mutable.{Map => MutableMap}

case class ChartRow(rowKey: String, values: Seq[Double]) {

  def this(date: Date, values: Seq[Double]) =
  {
    this((new DateTime(date.getTime)).toString("HH:mm"), values)
  }
}

case class ChartColumn(values: Seq[Datapoint])

class ChartTable(private val labels: Seq[String]) {

  lazy val columns: Int = labels.length

  private val datapoints: MutableMap[String, ChartColumn] = MutableMap.empty[String, ChartColumn].withDefaultValue(ChartColumn(Nil))

  def column(label: String): ChartColumn = datapoints(label)
  def allColumns: Seq[ChartColumn] = datapoints.values.toSeq

  def addColumn(label: String, data: ChartColumn) {
    datapoints += ((label, data))
  }

  def asChartRow(dateFormat: DateTime => String, toValue: Datapoint => Double): Seq[ChartRow] = {
    // Remove any holes in the data; some columns may have more data than others.
    val rows = MutableMap.empty[Date, List[Double]].withDefaultValue(Nil)

    for {
      label <- labels
      datapoint <- column(label).values
    } yield {
      val oldRow = rows(datapoint.getTimestamp)
      rows.update(datapoint.getTimestamp, oldRow ::: List(toValue(datapoint)))
    }

    val chartRows = for {
      row <- rows.filter(_._2.length == columns).toSeq.sortBy(_._1)
    } yield {
      // Create a chart row for every row that has a valid number of columns.
      ChartRow(dateFormat(new DateTime(row._1)), row._2)
    }

    chartRows.seq
  }
}

trait Chart {

  //used in html as element id
  lazy val id = UUID.randomUUID().toString

  def name: String
  def yAxis: Option[String] = None
  def labels: Seq[String]
  def dataset: Seq[ChartRow]

  def form: String = "LineChart"

  def asDataset = s"[[$labelString], $dataString]"

  private def labelString = labels.map(l => s"'$l'").mkString(",")
  private def datapointString(point: ChartRow) = {
    val data = point.values.mkString(",")
    s"['${point.rowKey}', $data]"
  }
  private def dataString = dataset.map(datapointString).mkString(",")
}

object PageviewsByDayGraph extends Chart with implicits.Tuples with implicits.Dates {
  val name = "Pageviews"
  lazy val labels = Seq("Date", "pageviews")

  def dataset = Analytics.getPageviewsByDay().toList sortBy { _.first } map {
    case (date, total) => ChartRow(date.toString("dd/MM"), Seq(total))
  }
}

object NewPageviewsByDayGraph extends Chart with implicits.Tuples with implicits.Dates{
  val name = "Pageviews (new users)"
  lazy val labels = Seq("Date", "pageviews")

  def dataset = Analytics.getNewPageviewsByDay().toList sortBy { _.first } map {
    case (date, total) => ChartRow(date.toString("dd/MM"), Seq(total))
  }
}

object PageviewsByCountryGeoGraph extends Chart {
  val name = "Pageviews"
  lazy val labels = Seq("Country", "pageviews")

  override lazy val form: String = "GeoChart"

  def dataset = Analytics.getPageviewsByCountry().toList map {
    case (country, total) => ChartRow(country, Seq(total))
  }
}

object PageviewsByOperatingSystemTreeMapGraph extends Chart {
  val name = ""

  override lazy val form: String = "TreeMap"

  lazy val labels = Seq("OS", "pageviews")
  def dataset = Analytics.getPageviewsByOperatingSystem().toList map {
    case (os, total) => ChartRow(os, Seq(total))
  }

  override def asDataset = s"[[$labelString], [$rootElement], $dataString]"
  private def labelString = "'OS','parent','pageviews'"
  private def rootElement = "'Operating System', null, 0"

  private def dataString = dataset.map(datapointString).mkString(",")
  private def datapointString(point: ChartRow) = {
    val data = point.values.mkString(",")
    s"['${point.rowKey}', 'Operating System', $data]"
  }
}

object PageviewsByBrowserTreeMapGraph extends Chart {
  val name = ""

  override lazy val form: String = "TreeMap"

  lazy val labels = Seq("Browsers", "pageviews")
  def dataset = Analytics.getPageviewsByBrowser().toList map {
    case (browser, total) => ChartRow(browser, Seq(total))
  }

  override def asDataset = s"[[$labelString], [$rootElement], $dataString]"
  private def labelString = "'Browser','parent','getPageviewsByDay'"
  private def rootElement = "'Browser', null, 0"

  private def dataString = dataset.map(datapointString).mkString(",")
  private def datapointString(point: ChartRow) = {
    val data = point.values.mkString(",")
    s"['${point.rowKey}', 'Browser', $data]"
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
      ChartRow(date.toString("dd/MM"), Seq(day(date), week(date), month(date)))
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
      ChartRow(date.toString("dd/MM"), Seq(day(date)/totalUsers, week(date)/totalUsers, month(date)/totalUsers))
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
      ChartRow(date.toString("dd/MM"), Seq(week(date), month(date)))
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
      ChartRow(date.toString("dd/MM"), Seq(week(date), month(date)))
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
      ChartRow(date.toString("dd/MM"), Seq(day(date)/monthlyUsers, week(date)/monthlyUsers))
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
  val MultiLine = ChartFormat(colours = Seq("#FF6600", "#99CC33", "#CC0066", "#660099", "#0099FF"), cssClass =  "charts charts-full")
}

class LineChart(val name: String, val labels: Seq[String], val charts: Future[GetMetricStatisticsResult]*) extends Chart {

  override lazy val dataset: Seq[ChartRow] = {
    val dataColumns = labels.tail
    val table = new ChartTable(dataColumns)

    (dataColumns, charts.toList).zipped.map( (column, chart) => {
      table.addColumn(column, ChartColumn(chart.get().getDatapoints))
    })

    table.asChartRow(toLabel, toValue)
  }
    
  def toValue(dataPoint: Datapoint): Double = Option(dataPoint.getAverage).orElse(Option(dataPoint.getSum))
      .getOrElse(throw new IllegalStateException(s"Don't know how to get a value for $dataPoint"))

  def toLabel(date: DateTime): String = date.toString("HH:mm")

  lazy val hasData = dataset.nonEmpty

  lazy val latest = dataset.lastOption.flatMap(_.values.headOption).getOrElse(0.0)

  lazy val format = ChartFormat.SingleLineBlue

  def withFormat(f: ChartFormat) = new LineChart(name, labels, charts:_*) {
    override lazy val format = f
  }
}

class AssetChart(name: String, labels: Seq[String], charts: Future[GetMetricStatisticsResult]*) extends LineChart(name, labels, charts:_*) {
  override def toLabel(date: DateTime): String = date.toString("dd/MM")
  override def withFormat(f: ChartFormat) = new AssetChart(name, labels, charts:_*) {
    override lazy val format = f
  }
}