package tools

import common.{ Logging, AkkaSupport }
import conf.AdminConfiguration
import play.api.GlobalSettings
import scala.slick.jdbc.StaticQuery
import scala.slick.session.Session
import scala.concurrent.duration._
import org.joda.time.DateTime

trait AnalyticsLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)
    AnalyticsService.start()
  }

  override def onStop(app: play.api.Application) {
    AnalyticsService.stop()
    super.onStop(app)
  }
}

case class AveragePageviewsByDayData(year: Int, month: Int, day: Int, average: Double) {
  lazy val key: (Int, Int, Int) = (year, month, day)
  lazy val date: DateTime = new DateTime(year, month, day, 0, 0, 0, 0)
}
case class ReturnUsersByDayData(year: Int, month: Int, day: Int, total: Long) {
  lazy val key: (Int, Int, Int) = (year, month, day)
  lazy val date: DateTime = new DateTime(year, month, day, 0, 0, 0, 0)
}
case class PageviewsData(year: Int, month: Int, day: Int, existing: Boolean, total: Long) {
  lazy val key: (Int, Int, Int) = (year, month, day)
  lazy val date: DateTime = new DateTime(year, month, day, 0, 0, 0, 0)
}
case class CountriesData(country: String, total: Long)
case class AgentData(operatingSystem: String, operatingSystemVersion: Option[String], browser: String, browserVersion: Option[String], total: Long) {
  lazy val operatingSystemAndVersion: String = s"$operatingSystem ${operatingSystemVersion.getOrElse("(unknown)")}".trim
  lazy val browserAndVersion: String = s"$browser ${browserVersion.getOrElse("(unknown)")}".trim
}

object Analytics {
  var averagePageviewsByDayTable: List[AveragePageviewsByDayData] = Nil
  var returnUsersByDayTable: List[ReturnUsersByDayData] = Nil
  var pageviewsTable: List[PageviewsData] = Nil
  var countriesTable: List[CountriesData] = Nil
  var agentsTable: List[AgentData] = Nil

  def averagePageviewsByDay(): List[(DateTime, Double)] = {
    val sorted = averagePageviewsByDayTable sortBy { _.key }
    sorted map { data => (data.date, data.average) }
  }

  def returnUsersByDay(): List[(DateTime, Long)] = {
    val sorted = returnUsersByDayTable sortBy { _.key }
    sorted map { data => (data.date, data.total) }
  }

  def pageviews(): List[(DateTime, Long)] = {
    // sum out the new/existing split
    val groups: Map[(Int, Int, Int), List[PageviewsData]] = pageviewsTable groupBy { _.key }
    val summed: Map[(Int, Int, Int), Long] = groups mapValues { data => (data map { _.total }).sum }
    val sorted: List[((Int, Int, Int), Long)] = summed.toList sortBy { _._1 }

    sorted map {
      case (key, total) => (new DateTime(key._1, key._2, key._3, 0, 0, 0, 0), total)
    }
  }

  def newCookies(): List[(DateTime, Long)] = {
    val newCookies: List[PageviewsData] = pageviewsTable filter { !_.existing }
    val sorted: List[PageviewsData] = newCookies sortBy { _.key }

    sorted map { data => (data.date, data.total) }
  }

  def countries(): List[(String, Long)] = countriesTable map { data => (data.country, data.total) }

  def operatingSystems(): List[(String, Long)] = {
    // sum out the browser splits
    val groups: Map[String, List[AgentData]] = agentsTable groupBy { _.operatingSystemAndVersion }
    val summed: Map[String, Long] = groups mapValues { data => (data map { _.total }).sum }

    summed.toList
  }

  def browsers(): List[(String, Long)] = {
    // sum out the browser splits
    val groups: Map[String, List[AgentData]] = agentsTable groupBy { _.browserAndVersion }
    val summed: Map[String, Long] = groups mapValues { data => (data map { _.total }).sum }

    summed.toList
  }
}

object AnalyticsService extends AkkaSupport with Logging {
  private lazy val refreshSchedule = play_akka.scheduler.every(6.hours) {
    log.info("Refreshing analytics data")
    refresh()
    log.info("Finished refreshing analytics data")
  }

  def refresh() {
    AdminConfiguration.analytics.db withSession { implicit session: Session =>
      val results = StaticQuery.queryNA[(Int, Int, Int, String, Long)]("""
        select year, month, day_of_month, new_or_existing, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by year, month, day_of_month, new_or_existing;
      """).list()

      val pageviews = results map {
        case (year, month, day, newOrExisting, total) => PageviewsData(year, month, day, newOrExisting == "E", total)
      }

      Analytics.pageviewsTable = pageviews
    }

    AdminConfiguration.analytics.db withSession { implicit session: Session =>
      // TODO: Remove ORDER and LIMIT below after Redshift fix
      val results = StaticQuery.queryNA[(String, Long)]("""
        select country, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by country
        order by total desc
        limit 64;
      """).list()

      val countries = results map {
        case (country, total) => CountriesData(country, total)
      }

      Analytics.countriesTable = countries
    }

    AdminConfiguration.analytics.db withSession { implicit session: Session =>
      val results = StaticQuery.queryNA[(String, String, String, String, Long)]("""
        select os_family, os_version_major, browser_family, browser_version, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by os_family, os_version_major, browser_family, browser_version
        order by total desc
        limit 64;
      """).list()

      val agents = results map {
        case (operatingSystem, operatingSystemVersion, browser, browserVersion, total) =>
          AgentData(operatingSystem, Option(operatingSystemVersion), browser, Option(browserVersion), total)
      }

      Analytics.agentsTable = agents
    }

    AdminConfiguration.analytics.db withSession { implicit session: Session =>
      val results = StaticQuery.queryNA[(Int, Int, Int, Double)]("""
        select year, month, day_of_month, avg(user_pageviews_for_day) from
        (
          select year, month, day_of_month, count(*)::float as user_pageviews_for_day from pageviews
          where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
          group by year, month, day_of_month, ophan
        )
        group by year, month, day_of_month;
      """).list()

      val averagePageviewsByDay = results map {
        case (year, month, day, average) => AveragePageviewsByDayData(year, month, day, average)
      }

      Analytics.averagePageviewsByDayTable = averagePageviewsByDay
    }

    AdminConfiguration.analytics.db withSession { implicit session: Session =>
      val results = StaticQuery.queryNA[(Int, Int, Int, Long)]("""
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
        group by year, month, day_of_month;
      """).list()

      val returnUsersByDay = results map {
        case (year, month, day, total) => ReturnUsersByDayData(year, month, day, total)
      }

      Analytics.returnUsersByDayTable = returnUsersByDay
    }
  }

  def start() {
    refreshSchedule
  }

  def stop() {
    refreshSchedule.cancel()
  }
}
