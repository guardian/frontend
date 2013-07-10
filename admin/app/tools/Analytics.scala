package tools

import common.{ CSV, S3 }
import conf.Configuration
import org.joda.time.DateTime

object Analytics extends implicits.Dates {

  def pageviews(): List[(DateTime, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(DateTime, String, Long)] = lines map { CSV.parse } collect {
      case List(year, month, day, existing, count) =>
        (new DateTime(year.toInt, month.toInt, day.toInt, 0, 0, 0, 0), existing, count.toLong)
    }

    // sum out the new/existing split
    val groups = parsed groupBy { _._1 }
    val summed = (groups mapValues { data => (data map { _._3 }).sum }).toList

    // Add missing days
    val first = (summed map { _._1 }).min.dayOfEpoch
    val last = (summed map { _._1 }).max.dayOfEpoch
    val zeros = (first to last).toList map { dayOfEpoch => (Epoch.day(dayOfEpoch), 0L) }

    val based = ((summed ++ zeros) groupBy { _._1.dayOfEpoch } mapValues { _ maxBy { _._2 } }).values.toList

    // Sort for display
    based sortBy { _._1 }
  }

  def newCookies(): List[(DateTime, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/pageviews.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(DateTime, String, Long)] = lines map { CSV.parse } collect {
      case List(year, month, day, existing, count) =>
        (new DateTime(year.toInt, month.toInt, day.toInt, 0, 0, 0, 0), existing, count.toLong)
    }

    // filter for new cookies
    val filtered = parsed filter { _._2.toUpperCase == "N" } map { data => (data._1, data._3) }

    // Add missing days
    val first = (filtered map { _._1 }).min.dayOfEpoch
    val last = (filtered map { _._1 }).max.dayOfEpoch
    val zeros = (first to last).toList map { dayOfEpoch => (Epoch.day(dayOfEpoch), 0L) }

    val based = ((filtered ++ zeros) groupBy { _._1.dayOfEpoch } mapValues { _ maxBy { _._2 } }).values.toList

    // Sort for display
    based sortBy { _._1 }
  }

  def pageviewsByCountry(): List[(String, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/countries.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(String, Long)] = lines map { CSV.parse } collect {
      case List(country, count) => (country.toUpperCase, count.toLong)
    }

    parsed
  }

  def pageviewsByOperatingSystem(): List[(String, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/agents.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(String, Long)] = lines map { CSV.parse } collect {
      case List(operatingSystem, operatingSystemVersion, _, _, count) =>
        (s"$operatingSystem ${Option(operatingSystemVersion).getOrElse("(unknown)")}".trim, count.toLong)
    }

    // sum out the operating system splits
    val groups = parsed groupBy { _._1 }
    val summed = groups mapValues { data => (data map { _._2 }).sum }

    summed.toList
  }

  def pageviewsByBrowser(): List[(String, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/agents.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(String, Long)] = lines map { CSV.parse } collect {
      case List(_, _, browser, browserVersion, count) =>
        (s"$browser ${Option(browserVersion).getOrElse("(unknown)")}".trim, count.toLong)
    }

    // sum out the browser splits
    val groups = parsed groupBy { _._1 }
    val summed = groups mapValues { data => (data map { _._2 }).sum }

    summed.toList
  }

  def averagePageviewsByDay(): List[(DateTime, Double)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/average-pageviews-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(DateTime, Double)] = lines map { CSV.parse } collect {
      case List(year, month, day, average) =>
        (new DateTime(year.toInt, month.toInt, day.toInt, 0, 0, 0, 0), average.toDouble)
    }

    // Add missing days
    val first = (parsed map { _._1 }).min.dayOfEpoch
    val last = (parsed map { _._1 }).max.dayOfEpoch
    val zeros = (first to last).toList map { dayOfEpoch => (Epoch.day(dayOfEpoch), 0.0) }

    val based = ((parsed ++ zeros) groupBy { _._1.dayOfEpoch } mapValues { _ maxBy { _._2 } }).values.toList

    // Sort for display
    based sortBy { _._1 }
  }

  def returnUsersByDay(): List[(DateTime, Long)] = {
    val data = S3.get(s"${Configuration.environment.stage.toUpperCase}/analytics/return-users-by-day.csv")
    val lines = data.toList flatMap { _.split("\n") }

    val parsed: List[(DateTime, Long)] = lines map { CSV.parse } collect {
      case List(year, month, day, count) =>
        (new DateTime(year.toInt, month.toInt, day.toInt, 0, 0, 0, 0), count.toLong)
    }

    // Add missing days
    val first = (parsed map { _._1 }).min.dayOfEpoch
    val last = (parsed map { _._1 }).max.dayOfEpoch
    val zeros = (first to last).toList map { dayOfEpoch => (Epoch.day(dayOfEpoch), 0L) }

    val based = ((parsed ++ zeros) groupBy { _._1.dayOfEpoch } mapValues { _ maxBy { _._2 } }).values.toList

    // Sort for display
    based sortBy { _._1 }
  }
}