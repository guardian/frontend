package tools

import common.CSV
import conf.Configuration
import org.joda.time.DateMidnight
import services.S3

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
  
  def getPageviewsByOperatingSystemAndBrowser(): Map[String, Long] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews-by-operating-system-and-browser.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(String, Long)] = lines map { CSV.parse } collect {
      case List(operatingSystemAndBrowserAndVersion, total) => (operatingSystemAndBrowserAndVersion, total.toLong)
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

  def getWeeklyPageviewsPerUserByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getWeeklyPageviewsPerUserByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getWeeklyPageviewsPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-pageviews-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getFourWeeklyPageviewsPerUserByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getFourWeeklyPageviewsPerUserByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getFourWeeklyPageviewsPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-pageviews-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getUsersByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getUsersByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/users-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
    }
  }

  def getWeeklyUsersByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getWeeklyUsersByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getWeeklyUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-users-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
    }
  }

  def getFourWeeklyUsersByDay(): Map[DateMidnight, Long] = {
    val uptyped: List[(DateMidnight, Long)] = getFourWeeklyUsersByDayDateExpanded collect {
      case (year, month, day, total) => (new DateMidnight(year, month, day), total)
    }

    uptyped.toMap
  }

  def getFourWeeklyUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-users-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, total) => (year.toInt, month.toInt, day.toInt, total.toLong)
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

  def getWeeklyDaysSeenPerUserByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getWeeklyDaysSeenPerUserByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getWeeklyDaysSeenPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-days-seen-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getWeeklyDaysSeenByDay(): Map[Int, Map[DateMidnight, Long]] = {
    getWeeklyDaysSeenByDayDateExpanded mapValues { dateExpanded =>
      val uptyped: List[(DateMidnight, Long)] = dateExpanded collect {
        case (year, month, day, count) => (new DateMidnight(year, month, day), count)
      }

      uptyped.toMap
    }
  }

  def getWeeklyDaysSeenByDayDateExpanded(): Map[Int, List[(Int, Int, Int, Long)]] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/weekly-days-seen-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val uptyped = lines map { CSV.parse } collect {
      case List(days, year, month, day, count) => (days.toInt, (year.toInt, month.toInt, day.toInt, count.toLong))
    }

    uptyped groupBy { _.first } mapValues { _ map { _.second }}
  }

  def getFourWeeklyDaysSeenPerUserByDay(): Map[DateMidnight, Double] = {
    val uptyped: List[(DateMidnight, Double)] = getFourWeeklyDaysSeenPerUserByDayDateExpanded collect {
      case (year, month, day, average) => (new DateMidnight(year, month, day), average)
    }

    uptyped.toMap
  }

  def getFourWeeklyDaysSeenPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-days-seen-per-user-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    lines map { CSV.parse } collect {
      case List(year, month, day, average) => (year.toInt, month.toInt, day.toInt, average.toDouble)
    }
  }

  def getFourWeeklyDaysSeenByDay(): Map[Int, Map[DateMidnight, Long]] = {
    getFourWeeklyDaysSeenByDayDateExpanded mapValues { dateExpanded =>
      val uptyped: List[(DateMidnight, Long)] = dateExpanded collect {
        case (year, month, day, count) => (new DateMidnight(year, month, day), count)
      }

      uptyped.toMap
    }
  }

  def getFourWeeklyDaysSeenByDayDateExpanded(): Map[Int, List[(Int, Int, Int, Long)]] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/four-weekly-days-seen-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val uptyped = lines map { CSV.parse } collect {
      case List(days, year, month, day, count) => (days.toInt, (year.toInt, month.toInt, day.toInt, count.toLong))
    }

    uptyped groupBy { _.first } mapValues { _ map { _.second }}
  }
}
