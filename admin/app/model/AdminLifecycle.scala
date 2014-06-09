package model

import play.api.{Application => PlayApp, GlobalSettings}
import tools.{LoadBalancer, CloudWatch}
import common.{AkkaAsync, Jobs}
import jobs.{AnalyticsSanityCheckJob, FastlyCloudwatchLoadJob}

trait AdminLifecycle extends GlobalSettings {

  private def scheduleJobs() {
    Jobs.schedule("AdminLoadJob", "0/30 * * * * ?") {
      model.abtests.AbTestJob.run()
    }

    Jobs.schedule("LoadBalancerLoadJob", "* 0/15 * * * ?") {
      LoadBalancer.refresh()
    }

    Jobs.schedule("FastlyCloudwatchLoadJob", "0 0/2 * * * ?") {
      FastlyCloudwatchLoadJob.run()
    }

    Jobs.schedule("AnalyticsSanityCheckJob", "0 0/15 * * * ?") {
      AnalyticsSanityCheckJob.run()
    }

    AkkaAsync{
      LoadBalancer.refresh()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("AdminLoadJob")
    Jobs.deschedule("LoadBalancerLoadJob")
    Jobs.deschedule("FastlyCloudwatchLoadJob")
    Jobs.deschedule("AnalyticsSanityCheckJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    CloudWatch.shutdown()
    super.onStop(app)
  }
}