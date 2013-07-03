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
    Pageviews.start()
  }

  override def onStop(app: play.api.Application) {
    Pageviews.stop()
    super.onStop(app)
  }
}

case class PageviewsData(year: Int, month: Int, day: Int, existing: Option[Boolean], total: Long) {
  lazy val key: (Int, Int, Int) = (year, month, day)
  lazy val date: DateTime = new DateTime(year, month, day, 0, 0, 0, 0)
}

case class CountriesData(country: String, total: Long)

object Pageviews extends AkkaSupport with Logging {
  private lazy val pageviewsAgent = play_akka.agent[List[PageviewsData]](Nil)
  private lazy val countriesAgent = play_akka.agent[List[CountriesData]](Nil)

  private lazy val refreshSchedule = play_akka.scheduler.every(4.hours) {
    log.info("Refreshing pageview count data")
    refresh()
    log.info("Finished refreshing pageview count data")
  }

  def refresh() {
    pageviewsAgent.send(AdminConfiguration.analytics.db withSession { implicit session: Session =>
      val results = StaticQuery.queryNA[(Int, Int, Int, String, Long)]("""
        select year, month, day_of_month, new_or_existing, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by year, month, day_of_month, new_or_existing;
      """).list()

      results map {
        case (year, month, day, newOrExisting, total) => PageviewsData(year, month, day, Option(newOrExisting == "E"), total)
      }
    })

    countriesAgent.send(AdminConfiguration.analytics.db withSession { implicit session: Session =>
      // TODO: Remove ORDER and LIMIT below after Redshift fix
      val results = StaticQuery.queryNA[(String, Long)]("""
        select country, count(*) as total
        from pageviews
        where host = 'm.guardian.co.uk' or host = 'm.guardiannews.com'
        group by country
        order by total desc
        limit 64;
      """).list()

      results map {
        case (country, total) => CountriesData(country, total)
      }
    })
  }

  def start() {
    refreshSchedule
  }

  def stop() {
    refreshSchedule.cancel()
    pageviewsAgent.close()
    countriesAgent.close()
  }

  def apply(): List[PageviewsData] = {
    // sum out the new/existing split
    val groups: Map[(Int, Int, Int), List[PageviewsData]] = pageviewsAgent() groupBy { _.key }
    val groupedTotals: Map[(Int, Int, Int), Long] = groups mapValues { data => (data map { _.total }).sum }

    val summed = groupedTotals.toList map {
      case (key, total) => PageviewsData(key._1, key._2, key._3, None, total)
    }

    summed sortBy { _.key }
  }

  def newCookies(): List[PageviewsData] = {
    val newCookies = pageviewsAgent() collect {
      case data @ PageviewsData(_, _, _, Some(false), _) => data
    }

    newCookies sortBy { _.key }
  }

  def countries(): List[CountriesData] = countriesAgent()
}
