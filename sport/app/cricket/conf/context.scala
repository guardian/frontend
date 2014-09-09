package conf

import common.{AkkaAsync, Jobs, ExecutionContexts}
import jobs.CricketStatsJob
import play.api.{Application, Plugin}
import scala.concurrent.duration._

class CricketStatsPlugin(app: Application) extends Plugin with ExecutionContexts {

  def scheduleJobs() {

    Jobs.schedule("CricketAgentRefreshJob", "0 * * * * ?") {
      CricketStatsJob.run()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("CricketAgentRefreshJob")
  }

  override def onStart() {
    descheduleJobs()
    scheduleJobs()

    AkkaAsync.after(5.seconds){
      CricketStatsJob.run()
    }
  }

  override def onStop() {
    descheduleJobs()
  }
}