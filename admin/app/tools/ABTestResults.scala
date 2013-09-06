package tools

import common.{CSV, S3}
import conf.Configuration
import org.joda.time.DateMidnight

object ABTestResults {

  def getSwipeAvgPageViewsPerSessionByVariantByDay(csvData: Option[String]
                                                         = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/swipe-ab-test-session-page-views-by-variant-by-day.csv")):
  Map[DateMidnight, List[(String, Double)]] = {

    val fields = (for {
      csvDataAsList <- csvData.toList
      lines <- csvDataAsList.split("\n")
    } yield CSV.parse(lines)) collect {
      case List(variant, year, month, day, count) => (variant, year.toInt, month.toInt, day.toInt, count.toDouble)
    }

    val groupedFields = fields groupBy {
      case (variant, year, month, day, count) => new DateMidnight(year, month, day)
    }

    for {
      (date, values) <- groupedFields
    } yield {
      val variantCounts = for {
        (variant, year, month, day, count) <- values
      } yield (variant, count)
      date -> variantCounts
    }
  }

}
