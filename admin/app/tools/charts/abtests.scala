package tools.charts

import org.joda.time.DateMidnight
import tools.{ABTestResults, Chart, DataPoint}

object SwipeAvgPageViewsPerSessionGraph extends Chart {
  val name = "Swipe Average Page Views per Session"
  override val yAxis = Some("Avg pvs / session")

  private lazy val defaultAvgPageViewsPerSessionByVariantByDay = ABTestResults.getSwipeAvgPageViewsPerSessionByVariantByDay()

  lazy val labels = extractLabels(defaultAvgPageViewsPerSessionByVariantByDay)

  def extractLabels(avgPageViewsPerUserByVariantByDay: Map[DateMidnight, List[(String, Double)]]) = {
    val variants = (for {
      (day, variantAvgPageViews) <- avgPageViewsPerUserByVariantByDay
      (variant, _) <- variantAvgPageViews
    } yield variant).toList.distinct.sorted
    "Date" :: variants
  }

  def dataset = buildDataset(defaultAvgPageViewsPerSessionByVariantByDay)

  def buildDataset(avgPageViewsPerUserByVariantByDay: Map[DateMidnight, List[(String, Double)]]) = {
    (for {
      (day, variantAvgPageViews) <- avgPageViewsPerUserByVariantByDay
    } yield {
      DataPoint(day.toString("dd/MM"), for {
        (_, avgPageViews) <- variantAvgPageViews
      } yield avgPageViews)
    }).toList
  }
}
