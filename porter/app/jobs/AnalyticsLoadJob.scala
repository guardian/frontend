package jobs

import common.{ CSV, PorterMetrics, S3 }
import conf.Configuration
import services.Analytics

class AnalyticsLoadJob extends Job {
  val cron = "0 0 8/24 * * ?"
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

    log.info("Generating analytics for pageviews/user by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-per-user-by-day.csv",
      Analytics.getPageviewsPerUserByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for weekly pageviews/users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-pageviews-per-user-by-day.csv",
      Analytics.getWeeklyPageviewsPerUserByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for four weekly pageviews/users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-pageviews-per-user-by-day.csv",
      Analytics.getFourWeeklyPageviewsPerUserByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/users-by-day.csv",
      Analytics.getUsersByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for return users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/return-users-by-day.csv",
      Analytics.getReturnUsersByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for weekly return users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-return-users-by-day.csv",
      Analytics.getWeeklyReturnUsersByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for four weekly return users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-return-users-by-day.csv",
      Analytics.getFourWeeklyReturnUsersByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for weekly (days seen)/users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-days-seen-per-user-by-day.csv",
      Analytics.getWeeklyDaysSeenPerUserByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )

    log.info("Generating analytics for four weekly (days seen)/users by day and uploading to S3.")
    S3.putPrivate(
      s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-days-seen-per-user-by-day.csv",
      Analytics.getFourWeeklyDaysSeenPerUserByDayDateExpanded() map { CSV.write } mkString "\n",
      "text/csv"
    )
  }
}