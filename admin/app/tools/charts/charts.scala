package tools

import java.util.{Date, UUID}
import common.editions.Uk
import org.joda.time.{DateTime, DateTimeZone}
import play.api.libs.json._
import software.amazon.awssdk.services.cloudwatch.model.{Datapoint, GetMetricStatisticsResponse}

import scala.jdk.CollectionConverters._
import scala.collection.mutable.{Map => MutableMap}

case class ChartRow[K](rowKey: K, values: Seq[Double])

case class ChartColumn(values: Seq[Datapoint])

class ChartTable(private val labels: Seq[String]) {

  lazy val columns: Int = labels.length

  private val datapoints: MutableMap[String, ChartColumn] =
    MutableMap.empty[String, ChartColumn].withDefaultValue(ChartColumn(Nil))

  def column(label: String): ChartColumn = datapoints(label)

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
      val oldRow = rows(Date.from(datapoint.timestamp()))
      rows.update(Date.from(datapoint.timestamp()), oldRow ::: List(toValue(datapoint)))
    }

    val chartRows = for {
      row <- rows.filter(_._2.length == columns).toSeq.sortBy(_._1)
    } yield {
      // Create a chart row for every row that has a valid number of columns.
      ChartRow(dateFormat(new DateTime(row._1)), row._2)
    }

    chartRows
  }
}

trait Chart[K] {

  // used in html as element id
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

object ChartFormat {

  val SingleLineBlack = ChartFormat(colours = Seq("#000000"))
  val SingleLineBlue = ChartFormat(colours = Seq("#0033CC"))
  val SingleLineRed = ChartFormat(colours = Seq("#FF0000"))

  def apply(colour: String*): ChartFormat = ChartFormat(colour)
}

class AwsLineChart(
    override val name: String,
    override val labels: Seq[String],
    override val format: ChartFormat,
    val charts: GetMetricStatisticsResponse*,
) extends Chart[String] {

  override def dataset: Seq[ChartRow[String]] = {
    val dataColumns = labels.tail
    val table = new ChartTable(dataColumns)

    dataColumns
      .lazyZip(charts.toList)
      .map((column, chart) => {
        table.addColumn(column, ChartColumn(chart.datapoints().asScala.toSeq))
      })

    table.asChartRow(toLabel, toValue)
  }

  protected def toValue(dataPoint: Datapoint): Double =
    Option(dataPoint.average())
      .orElse(Option(dataPoint.sum()))
      .getOrElse(throw new IllegalStateException(s"Don't know how to get a value for $dataPoint"))

  protected def toLabel(date: DateTime): String = date.withZone(format.timezone).toString("HH:mm")

  lazy val latest = dataset.lastOption.flatMap(_.values.headOption).getOrElse(0.0)

  def formatRowKey(key: String): String = s"'$key'"
}

object FormattedChart {

  case class DataTable(cols: Seq[Column], rows: Seq[Row])

  case class Column(id: String, label: String, `type`: String)

  case class Row(c: Seq[Cell])

  case class Cell(v: String)

  implicit val cellReads: OWrites[Cell] = Json.writes[Cell]
  implicit val rowReads: OWrites[Row] = Json.writes[Row]
  implicit val columnReads: OWrites[Column] = Json.writes[Column]
  implicit val tableReads: OWrites[DataTable] = Json.writes[DataTable]
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
