package commercial

import common.{JobScheduler, Logging}
import model.commercial.jobs.Industries
import model.commercial.events.MasterclassTagsAgent
import model.commercial.travel.Countries

trait RefreshJob extends Logging {

  def name: String
  def jobs: JobScheduler

  protected def refresh(): Unit

  def start(schedule: String): Unit = {
    jobs.deschedule(s"${name}RefreshJob")

    log.info(s"$name refresh on schedule $schedule")
    jobs.schedule(s"${name}RefreshJob", schedule) {
      refresh()
    }
  }

  def stop(): Unit = {
    jobs.deschedule(s"${name}RefreshJob")
  }
}

class MasterclassTagsRefresh(val jobs: JobScheduler) extends RefreshJob {

  val name: String = "MasterClassTags"

  def refresh() = MasterclassTagsAgent.refresh()
}

class CountriesRefresh(val jobs: JobScheduler) extends RefreshJob {

  val name: String = "Countries"

  def refresh() = Countries.refresh()

}

class IndustriesRefresh(val jobs: JobScheduler) extends RefreshJob {

  val name: String = "Industries"

  def refresh() = Industries.refresh()
}
