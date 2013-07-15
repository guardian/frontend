package jobs

import common.{ CSV, PorterMetrics, S3 }
import conf.Configuration
import services.Analytics

class AnalyticsLoadJob extends Job {
  val cron = "0 0 9/24 * * ?"
  val metric = PorterMetrics.AnalyticsLoadTimingMetric

  def run() {
    log.info("Generating analytics for pageviews by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-day.csv",
      Analytics.getPageviewsByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for new pageviews by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/new-pageviews-by-day.csv",
      Analytics.getNewPageviewsByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for pageviews by country and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-country.csv",
      Analytics.getPageviewsByCountry() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for pageviews by operating system and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-operating-system.csv",
      Analytics.getPageviewsByOperatingSystem() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for pageviews by browser and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-browser.csv",
      Analytics.getPageviewsByBrowser() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating pageviews by day analytics and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-per-user-by-day.csv",
      Analytics.getPageviewsPerUserByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating return users by day analytics and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/return-users-by-day.csv",
      Analytics.getReturnUsersByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )
  }
}