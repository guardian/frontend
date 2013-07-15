package services

import common.{ Logging, AkkaSupport }
import conf.PorterConfiguration
import scala.slick.jdbc.StaticQuery
import scala.slick.session.Session
import org.joda.time.DateMidnight

object Analytics extends AkkaSupport with Logging with implicits.Dates with implicits.Collections with implicits.Tuples with implicits.Statistics {

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

  def getPageviewsByOperatingSystem(): Map[String, Long] = {
    val pageviews: List[(String, String, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(String, String, Long)]( """
        select os_family, os_version_major, count(*) as total
        from pageviews
        where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
        group by os_family, os_version_major
        order by total desc
        limit 64
       """).list()
    }

    val relabeled: List[(String, Long)] = pageviews map {
      case (operatingSystem, operatingSystemVersion, total) =>
        (s"$operatingSystem ${Option(operatingSystemVersion).getOrElse("(unknown)")}".trim, total)
    }

    relabeled.toMap
  }

  def getPageviewsByBrowser(): Map[String, Long] = {
    val pageviews: List[(String, String, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(String, String, Long)]( """
        select browser_family, browser_version, count(*) as total
        from pageviews
        where (host = 'm.guardian.co.uk' or host = 'm.guardiannews.com')
        group by browser_family, browser_version
        order by total desc
        limit 64
       """).list()
    }

    val relabeled: List[(String, Long)] = pageviews map {
      case (browser, browserVersion, total) =>
        (s"$browser ${Option(browserVersion).getOrElse("(unknown)")}".trim, total)
    }

    relabeled.toMap
  }

  def getPageviewsPerUserByDay(): Map[DateMidnight, Double] = {
    val pageviews: List[(DateMidnight, Long, Long)] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long, Long)]( """
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
      val groups: Map[DateMidnight, List[(DateMidnight, Long, Long)]] = pageviews groupBy { _.first }
      val data: Map[DateMidnight, List[(Long, Long)]] = groups mapValues {
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

  def getReturnUsersByDay(): Map[DateMidnight, Long] = {
    val returns: Map[DateMidnight, Long] = PorterConfiguration.analytics.db withSession { implicit session: Session =>
      val data = StaticQuery.queryNA[(Int, Int, Int, Long)]( """
        select year, month, day_of_month, count(return_user_for_day) as return_users_for_day from
        (
          select p.year, p.month, p.day_of_month, p.ophan as return_user_for_day
          from pageviews p
          inner join users u
          on p.ophan = u.ophan
          where (p.host = 'm.guardian.co.uk' or p.host = 'm.guardiannews.com')
          and u.total_page_views > 1
          and u.first_seen_days_since_epoch < p.days_since_epoch
          group by p.year, p.month, p.day_of_month, p.ophan
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
}
