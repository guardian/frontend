package tools

import common.{ CSV, S3 }
import conf.Configuration
import org.joda.time.DateMidnight

object Analytics extends implicits.Dates with implicits.Tuples with implicits.Statistics {

  def getPageviewsByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getPageviewsByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getPageviewsByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(Int, Int, Int, Long)] = lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
    }

    parsed
  }

  def getNewPageviewsByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getNewPageviewsByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getNewPageviewsByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/new-pageviews-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
    }
  }

  def getPageviewsByCountry(): Map[String, Long] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-country.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(String, Long)] = lines map { CSV.parse } collect {
      case List(country, total) => (country, total.toLong)
    }

    parsed.toMap
  }

  def getPageviewsByOperatingSystem(): Map[String, Long] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-operating-system.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(String, Long)] = lines map { CSV.parse } collect {
      case List(operatingSystemAndVersion, total) => (operatingSystemAndVersion, total.toLong)
    }

    parsed.toMap
  }

  def getPageviewsByBrowser(): Map[String, Long] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-browser.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(String, Long)] = lines map { CSV.parse } collect {
      case List(browserAndVersion, total) => (browserAndVersion, total.toLong)
    }

    parsed.toMap
  }

  def getPageviewsPerUserByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getPageviewsPerUserByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getPageviewsPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getWeeklyPageviewsPerUsersByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getWeeklyPageviewsPerUsersByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getWeeklyPageviewsPerUsersByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-pageviews-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getFourWeeklyPageviewsPerUsersByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getFourWeeklyPageviewsPerUsersByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getFourWeeklyPageviewsPerUsersByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-pageviews-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getReturnUsersByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getReturnUsersByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getReturnUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/return-users-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
    }
  }

  def getWeeklyReturnUsersByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getWeeklyReturnUsersByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getWeeklyReturnUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-return-users-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
    }
  }

  def getFourWeeklyReturnUsersByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getFourWeeklyReturnUsersByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getFourWeeklyReturnUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-return-users-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
    }
  }

  def getWeeklyDaysSeenPerUsersByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getWeeklyDaysSeenPerUsersByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getWeeklyDaysSeenPerUsersByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-days-seen-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getFourWeeklyDaysSeenPerUsersByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getFourWeeklyDaysSeenPerUsersByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getFourWeeklyDaysSeenPerUsersByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-days-seen-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }
}