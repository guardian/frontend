package tools

import java.util.{Date, UUID}

import com.amazonaws.services.cloudwatch.model.{Datapoint, GetMetricStatisticsResult}
import common.editions.Uk
import org.joda.time.{DateTime, DateTimeZone}
import play.api.libs.json._

import scala.collection.JavaConverters._
import scala.collection.mutable.{Map => MutableMap}

case class ChartRow[K](rowKey: K, values: Seq[Double])

case class ChartColumn(values: Seq[Datapoint])

class ChartTable(private val labels: Seq[String]) {

  lazy val columns: Int = labels.length

  private val datapoints: MutableMap[String, ChartColumn] =
    MutableMap.empty[String, ChartColumn].withDefaultValue(ChartColumn(Nil))

  def column(label: String): ChartColumn = datapoints(label)
  def allColumns: Seq[ChartColumn] = datapoints.values.toSeq

  def addColumn(label: String, data: ChartColumn): Unit = {
    datapoints += ((label, data))
  }

  def asChartRow(dateFormat: DateTime => String, toValue: Datapoint => Double): Seq[ChartRow[String]] = {
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

trait Chart[K] {

  //used in html as element id
  lazy val id = UUID.randomUUID().toString

  def name: String
  def labels: Seq[String]
  def dataset: Seq[ChartRow[K]]
  def hasData: Boolean = dataset.nonEmpty
  def format: ChartFormat
  def dualY: Boolean = false
  def vAxisTitle: Option[String] = None

  def formatRowKey(key: K): String

  def asDataset: String = s"[[$labelString], $dataString]"

  private def labelString = labels.map(l => s"'$l'").mkString(",")
  private def datapointString(point: ChartRow[K]) = {
    val data = point.values.mkString(",")
    s"[${formatRowKey(point.rowKey)}, $data]"
  }
  private def dataString = dataset.map { datapointString }.mkString(",")
}

case class ChartFormat(colours: Seq[String], cssClass: String = "charts", timezone: DateTimeZone = Uk.timezone)

object Colour {
  val `tone-news-1` = "#005689"
  val `tone-news-2` = "#4bc6df"
  val `tone-features-1` = "#951c55"
  val `tone-features-2` = "#f66980"
  val `tone-features-3` = "#b82266"
  val `tone-features-4` = "#7d0068"
  val `tone-comment-1` = "#e6711b"
  val `tone-comment-2` = "#ffbb00"
  val `tone-comment-3` = "#ffcf4c"
  val `tone-live-1` = "#b51800"
  val `tone-live-2` = "#cc2b12"
  val error = "#d61d00"
  val success = "#4a7801"
}

object ChartFormat {

  val SingleLineBlack = ChartFormat(colours = Seq("#000000"))
  val SingleLineBlue = ChartFormat(colours = Seq("#0033CC"))
  val SingleLineGreen = ChartFormat(colours = Seq("#00CC33"))
  val SingleLineRed = ChartFormat(colours = Seq("#FF0000"))
  val DoubleLineBlueRed = ChartFormat(colours = Seq("#0033CC", "#FF0000"))
  val MultiLine =
    ChartFormat(colours = Seq("#FF6600", "#99CC33", "#CC0066", "#660099", "#0099FF"), cssClass = "charts charts-full")

  def apply(colour: String*): ChartFormat = ChartFormat(colour)
}

class AwsLineChart(
    override val name: String,
    override val labels: Seq[String],
    override val format: ChartFormat,
    val charts: GetMetricStatisticsResult*,
) extends Chart[String] {

  override def dataset: Seq[ChartRow[String]] = {
    val dataColumns = labels.tail
    val table = new ChartTable(dataColumns)

    (dataColumns, charts.toList).zipped.map((column, chart) => {
      table.addColumn(column, ChartColumn(chart.getDatapoints.asScala))
    })

    table.asChartRow(toLabel, toValue)
  }

  protected def toValue(dataPoint: Datapoint): Double =
    Option(dataPoint.getAverage)
      .orElse(Option(dataPoint.getSum))
      .getOrElse(throw new IllegalStateException(s"Don't know how to get a value for $dataPoint"))

  protected def toLabel(date: DateTime): String = date.withZone(format.timezone).toString("HH:mm")

  lazy val latest = dataset.lastOption.flatMap(_.values.headOption).getOrElse(0.0)

  def formatRowKey(key: String): String = s"'$key'"
}

class AwsDailyLineChart(name: String, labels: Seq[String], format: ChartFormat, charts: GetMetricStatisticsResult*)
    extends AwsLineChart(name, labels, format, charts: _*) {
  override def toLabel(date: DateTime): String = date.withZone(format.timezone).toString("dd/MM")
}

class AwsDualYLineChart(
    name: String,
    labels: (String, String, String),
    format: ChartFormat,
    chartOne: GetMetricStatisticsResult,
    chartTwo: GetMetricStatisticsResult,
) extends AwsLineChart(name, Seq(labels._1, labels._2, labels._3), format, chartOne, chartTwo) {
  override def dualY: Boolean = true
}

class ABDataChart(name: String, ablabels: Seq[String], format: ChartFormat, charts: GetMetricStatisticsResult*)
    extends AwsLineChart(name, ablabels, format, charts: _*) {

  private val dataColumns: Seq[(String, ChartColumn)] = {

    // Do not consider any metrics that have less than three data points.
    (ablabels.tail, charts.toList).zipped
      .map((column, chart) => (column, ChartColumn(chart.getDatapoints.asScala)))
      .filter { case (label, column) => column.values.length > 3 }
  }

  override def dataset: Seq[ChartRow[String]] = {

    val filteredTable = new ChartTable(dataColumns.map(_._1))

    for (column <- dataColumns) {
      filteredTable.addColumn(column._1, column._2)
    }

    filteredTable.asChartRow(toLabel, toValue)
  }

  override val labels: Seq[String] = Seq(ablabels.headOption.getOrElse("X axis")) ++ dataColumns.map(_._1)
}

object FormattedChart {

  case class DataTable(cols: Seq[Column], rows: Seq[Row])

  case class Column(id: String, label: String, `type`: String)

  case class Row(c: Seq[Cell])

  case class Cell(v: String)

  implicit val cellReads = Json.writes[Cell]
  implicit val rowReads = Json.writes[Row]
  implicit val columnReads = Json.writes[Column]
  implicit val tableReads = Json.writes[DataTable]
}

// A variation of Chart that can be easily serialised into a Google Visualization DataTable Json object.
// Useful for charts that need columns with type labels like Date and DateTime.
case class FormattedChart(
    name: String,
    columns: Seq[FormattedChart.Column],
    rows: Seq[FormattedChart.Row],
    format: ChartFormat,
) {

  lazy val id = UUID.randomUUID().toString
  lazy val labels: Seq[String] = columns.map(_.label)
  lazy val lastValue: Option[String] = rows.lastOption.flatMap { _.c.lastOption.map(_.v.take(6)) }

  def asJson(): JsValue = Json.toJson(FormattedChart.DataTable(columns, rows))
}
