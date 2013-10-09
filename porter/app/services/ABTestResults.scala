package services

import conf.PorterConfiguration
import scala.slick.jdbc.StaticQuery
import scala.slick.session.Session
import scala.math.BigDecimal
import scala.math.BigDecimal.RoundingMode
import org.joda.time.DateMidnight
import common.Logging


object ABTestResults extends implicits.Dates with Logging {

  private def round(value: Double) = BigDecimal(value).setScale(4, RoundingMode.HALF_UP).toDouble

  private def dataByDayByVariant(sql: String): List[(Int, String, Double)] = {

    log info ("Running SQL:\n%s" format sql)

    val data = PorterConfiguration.analytics.db withSession {
      implicit session: Session => StaticQuery.queryNA[(Int, String, Double)](sql).list()
    }

    data map {
      case (day, variant, dataValue) => (day, variant, round(dataValue / 1000))
    }
  }

  private def avgPageViewsPerSessionByDayByVariant(testName: String, testBegins: Option[DateMidnight] = None, testExpires: DateMidnight) = {
    val firstDayOfTest = testBegins map (_.dayOfEpoch) getOrElse "e.enrolled_days_since_epoch"
    val finalDayOfTest = testExpires.dayOfEpoch
    s"""with sessions as (
              select p.days_since_epoch, e.variant, p.ophan, p.ophan_visit, count(*) page_views
              from pageviews p, experiments e
              where e.ophan = p.ophan
              and e.name = '$testName'
              and e.variant != 'notintest'
              and p.ophan_visit is not null
              and p.days_since_epoch >= $firstDayOfTest
              and p.days_since_epoch <= $finalDayOfTest
              group by p.days_since_epoch, e.variant, p.ophan, p.ophan_visit
            )
            select days_since_epoch, variant, (1000*sum(page_views))/count(*) avg_page_views
            from sessions
            group by days_since_epoch, variant"""
  }

  private def avgSessionDurationByDayByVariant(testName: String, testExpires: DateMidnight) = {
    val finalDayOfTest = testExpires.dayOfEpoch
    s"""with sessions as (
              select p.days_since_epoch, e.variant, p.ophan, p.ophan_visit, max(p.timestamp) - p.visit_start_timestamp session_length
              from pageviews p, experiments e
              where e.ophan = p.ophan
              and e.name = '$testName'
              and e.variant != 'notintest'
              and p.ophan_visit is not null
              and p.days_since_epoch >= e.enrolled_days_since_epoch
              and p.days_since_epoch <= $finalDayOfTest
              group by p.days_since_epoch, e.variant, p.ophan, p.ophan_visit
            )
            select days_since_epoch, variant, sum(session_length)/count(*) avg_session_length
            from sessions
            group by days_since_epoch, variant"""
  }

  def getSwipeAvgPageViewsPerSessionByDayByVariant: List[(Int, String, Double)] = dataByDayByVariant {
    avgPageViewsPerSessionByDayByVariant("SwipeCtas", testExpires = new DateMidnight(2013, 8, 19))
  }

  def getSwipeAvgSessionDurationByDayByVariant: List[(Int, String, Double)] = dataByDayByVariant {
    avgSessionDurationByDayByVariant("SwipeCtas", testExpires = new DateMidnight(2013, 8, 19))
  }

  def getFacebookMostReadAvgPageViewsPerSessionByDayByVariant: List[(Int, String, Double)] = dataByDayByVariant {
    avgPageViewsPerSessionByDayByVariant("MostPopularFromFacebook",
      testBegins = Some(new DateMidnight(2013, 9, 25)), testExpires = new DateMidnight(2013, 10, 8))
  }
}
