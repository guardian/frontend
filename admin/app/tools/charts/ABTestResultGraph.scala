package tools.charts

import tools.{Chart, DataPoint}
import common.CSV
import conf.Configuration
import services.S3


trait ABTestResultGraph extends Chart with implicits.Dates {

  /*
   * Path to csv file holding data,
   * where each line holds a numeric value for a day and a variant
   * in form: <days since epoch>,<variant>,<value>
   */
  val dataLocation: String

  private def getDataFromCsv(csvData: Option[String] = S3.get(dataLocation)): List[(Int, String, Double)] = {
    (for {
      csvDataAsList <- csvData.toList
      lines <- csvDataAsList.split("\n")
    } yield CSV.parse(lines)) collect {
      case List(day, variant, duration) => (day.toInt, variant, duration.toDouble)
    }
  }

  private lazy val defaultData = getDataFromCsv()

  /*
   * Takes tuples holding day since epoch, variant and value.
   */
  def extractLabels(data: List[(Int, String, Double)]) = {
    val variants = (for ((_, variant, _) <- data) yield variant).distinct.sortWith(compareVariants)
    "Date" :: variants
  }

  lazy val labels = extractLabels(defaultData)

  /*
   * Takes tuples holding day since epoch, variant and value.
   */
  def buildDataset(data: List[(Int, String, Double)]) = {

    val groupedData = data groupBy {
      case (day, _, _) => day
    } mapValues {
      _.sortWith {
        case ((_, variant1, _), (_, variant2, _)) => compareVariants(variant1, variant2)
      }.map {
        case (_, _, duration) => duration
      }
    }

    groupedData.toList.sortBy {
      case (day, _) => day
    } map {
      case (dayOfEpoch, durations) => DataPoint(Epoch.day(dayOfEpoch).toString("dd/MM"), durations)
    }
  }

  def dataset = buildDataset(defaultData)

  private def compareVariants(variant1: String, variant2: String): Boolean = {
    (variant1, variant2) match {
      case ("control", _) => true
      case (_, "control") => false
      case (v1, v2) => v1.compareTo(v2) < 0
    }
  }
}


object SwipeAvgPageViewsPerSessionGraph extends ABTestResultGraph {

  val name = "Swipe Average Page Views per Session"
  override val yAxis = Some("Avg pvs / session")
  val dataLocation = s"${Configuration.environment.stage.toUpperCase}/analytics/ab-test-results/swipe-avg-session-page-views-by-day-by-variant.csv"
}


object SwipeAvgSessionDurationGraph extends ABTestResultGraph {

  val name = "Swipe Average Session Duration"
  override val yAxis = Some("Avg duration / session (s)")
  val dataLocation = s"${Configuration.environment.stage.toUpperCase}/analytics/ab-test-results/swipe-avg-session-durations-by-day-by-variant.csv"
}
