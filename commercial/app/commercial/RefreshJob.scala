package commercial

import common.{Jobs, Logging}
import model.commercial.jobs.Industries
import model.commercial.events.MasterclassTagsAgent
import model.commercial.money.BestBuysAgent
import model.commercial.travel.Countries

trait RefreshJob extends Logging {

  def name: String

  protected def refresh(): Unit

  def start(schedule: String): Unit = {
    Jobs.deschedule(s"${name}RefreshJob")

    log.info(s"$name refresh on schedule $schedule")
    Jobs.schedule(s"${name}RefreshJob", schedule) {
      refresh()
    }
  }

  def stop(): Unit = {
    Jobs.deschedule(s"${name}RefreshJob")
  }
}

object MasterClassTagsRefresh extends RefreshJob {

  val name: String = "MasterClassTags"

  def refresh() = MasterclassTagsAgent.refresh()
}

object CountriesRefresh extends RefreshJob {

  val name: String = "Countries"

  def refresh() = Countries.refresh()

}

object IndustriesRefresh extends RefreshJob {

  val name: String = "Industries"

  def refresh() = Industries.refresh()
}

object MoneyBestBuysRefresh extends RefreshJob {

  val name: String = "Best Buys"

  def refresh() = BestBuysAgent.refresh()
}
