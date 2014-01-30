package jobs

import common._
import conf.Configuration
import services.{S3, ABTestResults}

object ABTestResultsLoadJob extends Logging {

  def run() {

    log.info("Generating analytics for Swipe A/B test average page views per session by day by variant and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/ab-test-results/swipe-avg-session-page-views-by-day-by-variant.csv",
      ABTestResults.getSwipeAvgPageViewsPerSessionByDayByVariant map CSV.write mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for Swipe A/B test average session durations by day by variant and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/ab-test-results/swipe-avg-session-durations-by-day-by-variant.csv",
      ABTestResults.getSwipeAvgSessionDurationByDayByVariant map CSV.write mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for Facebook Most Read A/B test average page views per session by day by variant and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/ab-test-results/fb-most-read-session-page-views-by-day-by-variant.csv",
      ABTestResults.getFacebookMostReadAvgPageViewsPerSessionByDayByVariant map CSV.write mkString "\n",
      "text/csv"
    )
  }
}
