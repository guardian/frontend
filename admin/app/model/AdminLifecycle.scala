package model

import play.api.{Application => PlayApp, GlobalSettings}
import tools.{LoadBalancer, CloudWatch}
import common.{AkkaAsync, Jobs}

trait AdminLifecycle extends GlobalSettings {

  private def scheduleJobs() {
    Jobs.schedule("AdminLoadJob", "0/30 * * * * ?") {
      model.abtests.AbTestJob.run()
    }

    Jobs.schedule("LoadBalancerLoadJob", "* 0/15 * * * ?") {
      LoadBalancer.refresh()
    }

    AkkaAsync{
      LoadBalancer.refresh()
    }
  }

  private def descheduleJobs() {
    Jobs.deschedule("AdminLoadJob")
    Jobs.deschedule("LoadBalancerLoadJob")
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
