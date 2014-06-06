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

  override def dataset: Seq[ChartRow] = {
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

class ABDataChart(name: String, ablabels: Seq[String], f: ChartFormat, charts: Future[GetMetricStatisticsResult]*) extends LineChart(name, ablabels, charts:_*) {

  private val dataColumns: Seq[(String, ChartColumn)] = {

    // Do not consider any metrics that have less than three data points.
    (ablabels.tail, charts.toList).zipped.map( (column, chart) =>
      (column, ChartColumn(chart.get().getDatapoints))
    ).filter{ case (label, column)  => column.values.length > 3 }
  }

  override def dataset: Seq[ChartRow] = {

    val filteredTable = new ChartTable(dataColumns.map(_._1))

    for (column <- dataColumns) {
      filteredTable.addColumn(column._1, column._2)
    }

    filteredTable.asChartRow(toLabel, toValue)
  }

  override val labels: Seq[String] = Seq(ablabels.headOption.getOrElse("X axis")) ++ dataColumns.map(_._1)

  override lazy val format: ChartFormat = f
}