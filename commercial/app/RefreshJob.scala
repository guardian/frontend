package commercial

import common.{JobScheduler, Logging}
import commercial.model.merchandise.jobs.Industries

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

class IndustriesRefresh(industries: Industries, val jobs: JobScheduler) extends RefreshJob {

  val name: String = "Industries"

  def refresh() = industries.refresh()
}
