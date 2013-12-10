package services

import common.Logging
import conf.PorterConfiguration
import scala.slick.jdbc.StaticQuery
import scala.slick.session.Session
import org.joda.time.{DateMidnight, DateTime}

object Analytics extends Logging with implicits.Dates with implicits.Collections with implicits.Tuples with implicits.Statistics {

  def getPageviewsByDay(): Map[DateMidnight, Long] = {
    val pageviews: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]("""
        select year, month, day_of_month, count(*) as total
        from pageviews
        where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val pageviewsWithZeros = {
      val withZeros = pageviews.withDefaultValue(0L)
      val dateRange = pageviews.keySet.min.dayOfEpoch to pageviews.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    pageviewsWithZeros
  }

  def getPageviewsByDayDateExpanded(): List[(Int, Int, Int, Long)] = getPageviewsByDay().toList map {
      case (day, pageviews) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, pageviews)
  }

  def getNewPageviewsByDay(): Map[DateMidnight, Long] = {
    val pageviews: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]("""
        select year, month, day_of_month, count(*) as total
        from pageviews
        where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
        and new_or_existing = 'N'
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val pageviewsWithZeros = {
      val withZeros = pageviews.withDefaultValue(0L)
      val dateRange = pageviews.keySet.min.dayOfEpoch to pageviews.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    pageviewsWithZeros
  }

  def getNewPageviewsByDayDateExpanded(): List[(Int, Int, Int, Long)] = getNewPageviewsByDay().toList map {
    case (day, pageviews) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, pageviews)
  }

  def getPageviewsByCountry(): Map[String, Long] = {
    val pageviews: Map[String, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data: List[(String, Long)] = StaticQuery.queryNA[(String, Long)]("""
        select country, count(*) as total
        from pageviews
        where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
        group by country
      """).list()

      val uptyped = data map {
        case (country, total) => (Option(country) getOrElse "", total)
      }

      uptyped.toMap
    }

    val relabeled: Map[String, Long] = pageviews map {
      case (country, total) => (country.toUpperCase, total)
    }

    relabeled
  }
 
  def getPageviewsByOperatingSystemAndBrowser(): Map[String, Long] = {
    val pageviews: List[(String, String, String, String, String, String, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(String, String, String, String, String, String, Long)]( s"""
        select os_family, os_version_major, browser_family, browser_version_major, month, year, count(*) as total
        from pageviews
        where month = ${new DateTime().minusMonths(1).getMonthOfYear} and year = ${new DateTime().minusMonths(1).getYear}
        group by os_family, os_version_major, browser_family, browser_version_major, month, year
        order by total desc
        limit 1000
       """).list()
    }

    val relabeled: List[(String, Long)] = pageviews map {
      case (operatingSystem, operatingSystemVersion, browser, browserVersionMajor, month, year, total) =>
        (s"$operatingSystem ${Option(operatingSystemVersion).getOrElse("(unknown)")} $browser ${Option(browserVersionMajor).getOrElse("(unknown)")}".trim, total)
    }

    relabeled.toMap
  }

  def getPageviewsByOperatingSystem(): Map[String, Long] = {
    val pageviews: List[(String, String, String, String, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(String, String, String, String, Long)]( s"""
        select os_family, os_version_major, month, year, count(*) as total
        from pageviews
        where month = ${new DateTime().minusMonths(1).getMonthOfYear} and year = ${new DateTime().minusMonths(1).getYear}
        group by os_family, os_version_major, month, year
        order by total desc
        limit 64
       """).list()
    }

    val relabeled: List[(String, Long)] = pageviews map {
      case (operatingSystem, operatingSystemVersion, month, year, total) =>
        (s"$operatingSystem ${Option(operatingSystemVersion).getOrElse("(unknown)")}".trim, total)
    }

    relabeled.toMap
  }

  def getPageviewsByBrowser(): Map[String, Long] = {
    val pageviews: List[(String, String, String, String, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(String, String, String, String, Long)]( s"""
        select browser_family, browser_version_major, month, year, count(*) as total
        from pageviews
        where month = ${new DateTime().minusMonths(1).getMonthOfYear} and year = ${new DateTime().minusMonths(1).getYear}
        group by browser_family, browser_version_major, month, year
        order by total desc
        limit 64
       """).list()
    }

    val relabeled: List[(String, Long)] = pageviews map {
      case (browser, browserVersionMajor, month, year, total) =>
        (s"$browser ${Option(browserVersionMajor).getOrElse("(unknown)")}".trim, total)
    }

    relabeled.toMap
  }

  def getPageviewsPerUserByDay(): Map[DateMidnight, Double] = {
    val pageviews: List[(DateMidnight, Int, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Int, Long)]( """
        select year, month, day_of_month, user_pageviews_for_day, count(*) as count from
        (
          select year, month, day_of_month, count(*) as user_pageviews_for_day from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, ophan
        )
        group by year, month, day_of_month, user_pageviews_for_day
      """).list()

      data map {
        case (year, month, day, pageviews, total) => (new DateMidnight(year, month, day), pageviews, total)
      }
    }

    val pageviewsPerUser: Map[DateMidnight, Double] = {
      val groups: Map[DateMidnight, List[(DateMidnight, Int, Long)]] = pageviews groupBy { _.first }
      val data: Map[DateMidnight, List[(Int, Long)]] = groups mapValues {
        distribution => distribution map { point => (point.second, point.third) }
      }

      data mapValues { _.weightedAverage }
    }

    val pageviewsPerUserWithZeros = {
      val withZeros = pageviewsPerUser.withDefaultValue(0.0)
      val dateRange = pageviewsPerUser.keySet.min.dayOfEpoch to pageviewsPerUser.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    pageviewsPerUserWithZeros
  }

  def getPageviewsPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = getPageviewsPerUserByDay().toList map {
    case (day, pageviews) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, pageviews)
  }

  def getWeeklyPageviewsPerUserByDay(): Map[DateMidnight, Double] = {
    val pageviews: List[(DateMidnight, Int, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan, count(*) as pageviews
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, user_pageviews_for_week, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan, sum(d2.pageviews) as user_pageviews_for_week
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d1.days_since_epoch >= d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 7
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month, user_pageviews_for_week
      """).list()

      data map {
        case (year, month, day, pageviews, count) => (new DateMidnight(year, month, day), pageviews, count)
      }
    }

    val pageviewsPerUser: Map[DateMidnight, Double] = {
      val groups: Map[DateMidnight, List[(DateMidnight, Int, Long)]] = pageviews groupBy { _.first }
      val data: Map[DateMidnight, List[(Int, Long)]] = groups mapValues {
        distribution => distribution map { point => (point.second, point.third) }
      }

      data mapValues { _.weightedAverage }
    }

    val pageviewsPerUserWithZeros = {
      val withZeros = pageviewsPerUser.withDefaultValue(0.0)
      val dateRange = pageviewsPerUser.keySet.min.dayOfEpoch to pageviewsPerUser.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    pageviewsPerUserWithZeros
  }

  def getWeeklyPageviewsPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = getWeeklyPageviewsPerUserByDay().toList map {
    case (day, pageviews) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, pageviews)
  }

  def getFourWeeklyPageviewsPerUserByDay(): Map[DateMidnight, Double] = {
    val pageviews: List[(DateMidnight, Int, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan, count(*) as pageviews
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, user_pageviews_for_four_weeks, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan, sum(d2.pageviews) as user_pageviews_for_four_weeks
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d1.days_since_epoch >= d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 28
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month, user_pageviews_for_four_weeks
      """).list()

      data map {
        case (year, month, day, pageviews, count) => (new DateMidnight(year, month, day), pageviews, count)
      }
    }

    val pageviewsPerUser: Map[DateMidnight, Double] = {
      val groups: Map[DateMidnight, List[(DateMidnight, Int, Long)]] = pageviews groupBy { _.first }
      val data: Map[DateMidnight, List[(Int, Long)]] = groups mapValues {
        distribution => distribution map { point => (point.second, point.third) }
      }

      data mapValues { _.weightedAverage }
    }

    val pageviewsPerUserWithZeros = {
      val withZeros = pageviewsPerUser.withDefaultValue(0.0)
      val dateRange = pageviewsPerUser.keySet.min.dayOfEpoch to pageviewsPerUser.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    pageviewsPerUserWithZeros
  }

  def getFourWeeklyPageviewsPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = getFourWeeklyPageviewsPerUserByDay().toList map {
    case (day, pageviews) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, pageviews)
  }

  def getUsersByDay(): Map[DateMidnight, Long] = {
    val users: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]("""
        select year, month, day_of_month, count(*) as total
        from (
          select year, month, day_of_month, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, ophan
        )
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val usersWithZeros = {
      val withZeros = users.withDefaultValue(0L)
      val dateRange = users.keySet.min.dayOfEpoch to users.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    usersWithZeros
  }

  def getUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = getUsersByDay().toList map {
    case (day, users) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, users)
  }

  def getWeeklyUsersByDay(): Map[DateMidnight, Long] = {
    val users: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]("""
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        ), range as (
          select year, month, day_of_month, days_since_epoch
          from day
          group by year, month, day_of_month, days_since_epoch
        )
        select year, month, day_of_month, count(*) as count
        from (
          select range.year, range.month, range.day_of_month, day.ophan
          from day, range
          where range.days_since_epoch >= day.days_since_epoch
          and day.days_since_epoch > range.days_since_epoch - 7
          group by range.year, range.month, range.day_of_month, day.ophan
        )
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val usersWithZeros = {
      val withZeros = users.withDefaultValue(0L)
      val dateRange = users.keySet.min.dayOfEpoch to users.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    usersWithZeros
  }

  def getWeeklyUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = getWeeklyUsersByDay().toList map {
    case (day, users) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, users)
  }

  def getFourWeeklyUsersByDay(): Map[DateMidnight, Long] = {
    val users: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]("""
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        ), range as (
          select year, month, day_of_month, days_since_epoch
          from day
          group by year, month, day_of_month, days_since_epoch
        )
        select year, month, day_of_month, count(*) as count
        from (
          select range.year, range.month, range.day_of_month, day.ophan
          from day, range
          where range.days_since_epoch >= day.days_since_epoch
          and day.days_since_epoch > range.days_since_epoch - 28
          group by range.year, range.month, range.day_of_month, day.ophan
        )
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val usersWithZeros = {
      val withZeros = users.withDefaultValue(0L)
      val dateRange = users.keySet.min.dayOfEpoch to users.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    usersWithZeros
  }

  def getFourWeeklyUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = getFourWeeklyUsersByDay().toList map {
    case (day, users) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, users)
  }

  def getReturnUsersByDay(): Map[DateMidnight, Long] = {
    val returns: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d2.days_since_epoch = d1.days_since_epoch - 1
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val returnsWithZeros = {
      val withZeros = returns.withDefaultValue(0L)
      val dateRange = returns.keySet.min.dayOfEpoch to returns.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    returnsWithZeros
  }

  def getReturnUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = getReturnUsersByDay().toList map {
    case (day, returns) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, returns)
  }

  def getWeeklyReturnUsersByDay(): Map[DateMidnight, Long] = {
    val returns: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan 
          where d1.days_since_epoch > d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 7
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val returnsWithZeros = {
      val withZeros = returns.withDefaultValue(0L)
      val dateRange = returns.keySet.min.dayOfEpoch to returns.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    returnsWithZeros
  }

  def getWeeklyReturnUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = getWeeklyReturnUsersByDay().toList map {
    case (day, returns) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, returns)
  }

  def getFourWeeklyReturnUsersByDay(): Map[DateMidnight, Long] = {
    val returns: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d1.days_since_epoch > d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 28
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month
      """).list()

      val uptyped = data map {
        case (year, month, day, total) => (new DateMidnight(year, month, day), total)
      }

      uptyped.toMap
    }

    val returnsWithZeros = {
      val withZeros = returns.withDefaultValue(0L)
      val dateRange = returns.keySet.min.dayOfEpoch to returns.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    returnsWithZeros
  }

  def getFourWeeklyReturnUsersByDayDateExpanded(): List[(Int, Int, Int, Long)] = getFourWeeklyReturnUsersByDay().toList map {
    case (day, returns) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, returns)
  }

  def getWeeklyDaysSeenPerUserByDay(): Map[DateMidnight, Double] = {
    val daysSeen: List[(DateMidnight, Int, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, user_days_seen_for_week, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan, count(*) as user_days_seen_for_week
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d1.days_since_epoch >= d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 7
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month, user_days_seen_for_week
      """).list()

      data map {
        case (year, month, day, daysSeen, count) => (new DateMidnight(year, month, day), daysSeen, count)
      }
    }

    val daysSeenPerUser: Map[DateMidnight, Double] = {
      val groups: Map[DateMidnight, List[(DateMidnight, Int, Long)]] = daysSeen groupBy { _.first }
      val data: Map[DateMidnight, List[(Int, Long)]] = groups mapValues {
        distribution => distribution map { point => (point.second, point.third) }
      }

      data mapValues { _.weightedAverage }
    }

    val daysSeenPerUserWithZeros = {
      val withZeros = daysSeenPerUser.withDefaultValue(0.0)
      val dateRange = daysSeenPerUser.keySet.min.dayOfEpoch to daysSeenPerUser.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    daysSeenPerUserWithZeros
  }

  def getWeeklyDaysSeenPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = getWeeklyDaysSeenPerUserByDay().toList map {
    case (day, days_seen) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, days_seen)
  }

  def getWeeklyDaysSeenByDay(): Map[Int, Map[DateMidnight, Long]] = {
    val daysSeen: List[(DateMidnight, Int, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, user_days_seen_for_week, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan, count(*) as user_days_seen_for_week
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d1.days_since_epoch >= d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 7
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month, user_days_seen_for_week
      """).list()

      data map {
        case (year, month, day, daysSeen, count) => (new DateMidnight(year, month, day), daysSeen, count)
      }
    }

    val reshaped: List[(Int, (DateMidnight, Long))] = daysSeen map { case (date, days, count) => (days, (date, count)) }
    val groupedByDays: Map[Int, List[(Int,(DateMidnight, Long))]] = reshaped groupBy { _.first }
    val reshapedValues: Map[Int, List[(DateMidnight, Long)]] = groupedByDays mapValues { _.map { _.second } }
    val collated: Map[Int, Map[DateMidnight, Long]] = reshapedValues mapValues { _.toMap }

    collated map { case (days, daysSeen) =>
      val daysSeenPerUserWithZeros = {
        val withZeros = daysSeen.withDefaultValue(0L)
        val dateRange = daysSeen.keySet.min.dayOfEpoch to daysSeen.keySet.max.dayOfEpoch
        dateRange map { Epoch.day } toMapWith { withZeros.apply }
      }

      (days, daysSeenPerUserWithZeros)
    }
  }

  def getWeeklyDaysSeenByDayDateExpanded(): List[(Int, Int, Int, Int, Long)] = {
    val reshaped: List[(Int, List[(DateMidnight, Long)])] = (getWeeklyDaysSeenByDay() mapValues { _.toList }).toList
    val flattened: List[(Int, DateMidnight, Long)] = reshaped flatMap { case (days, values) =>
      for (value <- values) yield (days, value.first, value.second)
    }

    flattened map {
      case (days, day, count) => (days, day.year.get, day.monthOfYear.get, day.dayOfMonth.get, count)
    }
  }

  def getFourWeeklyDaysSeenPerUserByDay(): Map[DateMidnight, Double] = {
    val daysSeen: List[(DateMidnight, Int, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, user_days_seen_for_four_weeks, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan, count(*) as user_days_seen_for_four_weeks
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d1.days_since_epoch >= d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 28
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month, user_days_seen_for_four_weeks
      """).list()

      data map {
        case (year, month, day, daysSeen, count) => (new DateMidnight(year, month, day), daysSeen, count)
      }
    }

    val daysSeenPerUser: Map[DateMidnight, Double] = {
      val groups: Map[DateMidnight, List[(DateMidnight, Int, Long)]] = daysSeen groupBy { _.first }
      val data: Map[DateMidnight, List[(Int, Long)]] = groups mapValues {
        distribution => distribution map { point => (point.second, point.third) }
      }

      data mapValues { _.weightedAverage }
    }

    val daysSeenPerUserWithZeros = {
      val withZeros = daysSeenPerUser.withDefaultValue(0.0)
      val dateRange = daysSeenPerUser.keySet.min.dayOfEpoch to daysSeenPerUser.keySet.max.dayOfEpoch
      dateRange map { Epoch.day } toMapWith { withZeros.apply }
    }

    daysSeenPerUserWithZeros
  }

  def getFourWeeklyDaysSeenPerUserByDayDateExpanded(): List[(Int, Int, Int, Double)] = getFourWeeklyDaysSeenPerUserByDay().toList map {
    case (day, days_seen) => (day.year.get, day.monthOfYear.get, day.dayOfMonth.get, days_seen)
  }

  def getFourWeeklyDaysSeenByDay(): Map[Int, Map[DateMidnight, Long]] = {
    val daysSeen: List[(DateMidnight, Int, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Int, Long)]( """
        with day as (
          select year, month, day_of_month, days_since_epoch, ophan
          from pageviews
          where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
          group by year, month, day_of_month, days_since_epoch, ophan
        )
        select year, month, day_of_month, user_days_seen_for_four_weeks, count(*) as count
        from (
          select d1.year, d1.month, d1.day_of_month, d1.ophan, count(*) as user_days_seen_for_four_weeks
          from day d1
          inner join day d2
          on d1.ophan = d2.ophan
          where d1.days_since_epoch >= d2.days_since_epoch
          and d2.days_since_epoch > d1.days_since_epoch - 28
          group by d1.year, d1.month, d1.day_of_month, d1.ophan
        )
        group by year, month, day_of_month, user_days_seen_for_four_weeks
      """).list()

      data map {
        case (year, month, day, daysSeen, count) => (new DateMidnight(year, month, day), daysSeen, count)
      }
    }

    val reshaped: List[(Int, (DateMidnight, Long))] = daysSeen map { case (date, days, count) => (days, (date, count)) }
    val groupedByDays: Map[Int, List[(Int,(DateMidnight, Long))]] = reshaped groupBy { _.first }
    val reshapedValues: Map[Int, List[(DateMidnight, Long)]] = groupedByDays mapValues { _.map { _.second } }
    val collated: Map[Int, Map[DateMidnight, Long]] = reshapedValues mapValues { _.toMap }

    collated map { case (days, daysSeen) =>
      val daysSeenPerUserWithZeros = {
        val withZeros = daysSeen.withDefaultValue(0L)
        val dateRange = daysSeen.keySet.min.dayOfEpoch to daysSeen.keySet.max.dayOfEpoch
        dateRange map { Epoch.day } toMapWith { withZeros.apply }
      }

      (days, daysSeenPerUserWithZeros)
    }
  }

  def getFourWeeklyDaysSeenByDayDateExpanded(): List[(Int, Int, Int, Int, Long)] = {
    val reshaped: List[(Int, List[(DateMidnight, Long)])] = (getFourWeeklyDaysSeenByDay() mapValues { _.toList }).toList
    val flattened: List[(Int, DateMidnight, Long)] = reshaped flatMap { case (days, values) =>
      for (value <- values) yield (days, value.first, value.second)
    }

    flattened map {
      case (days, day, count) => (days, day.year.get, day.monthOfYear.get, day.dayOfMonth.get, count)
    }
  }
}
