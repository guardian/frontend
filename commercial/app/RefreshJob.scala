package commercial

import common.{JobScheduler, GuLogging}
import commercial.model.merchandise.jobs.Industries

import scala.concurrent.ExecutionContext

trait RefreshJob extends GuLogging {

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

class IndustriesRefresh(industries: Industries, val jobs: JobScheduler)(implicit executionContext: ExecutionContext)
    extends RefreshJob {

  val name: String = "Industries"

  def refresh(): Unit = industries.refresh()
}
