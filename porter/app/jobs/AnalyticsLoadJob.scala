package jobs

import common.{ CSV, PorterMetrics, S3 }
import conf.Configuration
import services.Analytics

class AnalyticsLoadJob extends Job {
  val cron = "0 0 9/24 * * ?"
  val metric = PorterMetrics.AnalyticsLoadTimingMetric

  def run() {
    log.info("Generating pageviews analytics and uploading to S3.")
    S3.put(
      s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews.csv",
      Analytics.getPageviewsData() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating countries analytics and uploading to S3.")
    S3.put(
      s"${Configuration.environment.stage.toUpperCase}/analytics/countries.csv",
      Analytics.getCountriesData() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating agents analytics and uploading to S3.")
    S3.put(
      s"${Configuration.environment.stage.toUpperCase}/analytics/agents.csv",
      Analytics.getAgentData() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating average pageviews by day analytics and uploading to S3.")
    S3.put(
      s"${Configuration.environment.stage.toUpperCase}/analytics/average-pageviews-by-day.csv",
      Analytics.getAveragePageviewsByDayData() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating return users by day analytics and uploading to S3.")
    S3.put(
      s"${Configuration.environment.stage.toUpperCase}/analytics/return-users-by-day.csv",
      Analytics.getReturnUsersByDayData() map { CSV.write } mkString "\n",
      "text/csv"
    )
  }
}