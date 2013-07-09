package services

import common.{ Logging, AkkaSupport }
import conf.PorterConfiguration
import scala.slick.jdbc.StaticQuery
import scala.slick.session.Session


object Analytics extends AkkaSupport with Logging {

  def getPageviewsData(): List[(Int, Int, Int, String, Long)] = {
    PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(Int, Int, Int, String, Long)]("""
        select year, month, day_of_month, new_or_existing, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by year, month, day_of_month, new_or_existing
      """).list()
    }
  }

  def getCountriesData(): List[(String, Long)] = {
    PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(String, Long)]("""
        select country, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by country
      """).list()
    }
  }

  def getAgentData(): List[(String, String, String, String, Long)] = {
    PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(String, String, String, String, Long)]( """
        select os_family, os_version_major, browser_family, browser_version, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by os_family, os_version_major, browser_family, browser_version
        order by total desc
        limit 64
      """).list()
    }
  }

  def getAveragePageviewsByDayData(): List[(Int, Int, Int, Double)] = {
    PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(Int, Int, Int, Double)]( """
        select year, month, day_of_month, avg(user_pageviews_for_day) from
        (
          select year, month, day_of_month, count(*)::float as user_pageviews_for_day from pageviews
          where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
          group by year, month, day_of_month, ophan
        )
        group by year, month, day_of_month
      """).list()
    }
  }

  def getReturnUsersByDayData(): List[(Int, Int, Int, Long)] = {
    PorterConfiguration.analytics.db withSession { implicit session: Session =>
      StaticQuery.queryNA[(Int, Int, Int, Long)]( """
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
    }
  }
}
