package services

import conf.PorterConfiguration
import scala.slick.jdbc.StaticQuery
import scala.slick.session.Session
import scala.math.BigDecimal
import scala.math.BigDecimal.RoundingMode

object ABTestResults {

  private def round(value: Double) = BigDecimal(value).setScale(4, RoundingMode.HALF_UP).toDouble

  def getSwipeAvgPageViewsPerSessionByDayByVariant: List[(Int, String, Double)] = {

    val data = PorterConfiguration.analytics.db withSession {
      implicit session: Session =>
        StaticQuery.queryNA[(String, Int, String, String, Int)](
          """select e.variant, p.days_since_epoch, p.ophan, p.ophan_visit sessions, count(*) page_views
              from pageviews p, experiments e
              where p.ophan = e.ophan
              and e.name = 'SwipeCtas'
              and p.days_since_epoch >= e.enrolled_days_since_epoch
              and p.days_since_epoch <= e.last_occurrence_days_since_epoch
              group by e.variant, p.days_since_epoch, p.ophan, p.ophan_visit"""
        ).list()
    }

    val cleanedData = data filterNot {
      case (_, day, _, session, _) => day == 0 || session == null
    }

    cleanedData.groupBy {
      case (variant, day, _, _, _) => (variant, day)
    }.mapValues {
      case values => {
        val variant = values(0)._1
        val day = values(0)._2
        val variantDayPageViews = values.map(_._5).sum
        val variantDaySessions = values.size
        val avgPageViewsPerSession = round(variantDayPageViews.toDouble / variantDaySessions)
        (day, variant, avgPageViewsPerSession)
      }
    }.values.toList
  }

  def getSwipeAvgSessionDurationByDayByVariant: List[(Int, String, Double)] = {

    val data = PorterConfiguration.analytics.db withSession {
      implicit session: Session =>
        StaticQuery.queryNA[(Int, String, Double)](
          """with sessions as (
                select p.days_since_epoch, e.variant, p.ophan, p.ophan_visit, max(p.timestamp) - p.visit_start_timestamp session_length
                from experiments e, pageviews p
                where e.ophan = p.ophan
                and name = 'SwipeCtas'
                and p.days_since_epoch >= e.enrolled_days_since_epoch
                and p.days_since_epoch <= e.last_occurrence_days_since_epoch
                group by p.days_since_epoch, e.variant, p.ophan, p.ophan_visit, p.visit_start_timestamp
              )
              select days_since_epoch, variant, sum(session_length)/count(*) avg_session_length
              from sessions
              group by days_since_epoch, variant"""
        ).list()
    }

    data map {
      case (day, variant, duration) => (day, variant, round(duration / 1000))
    }
  }
}
