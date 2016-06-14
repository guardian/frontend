package common.dfp

import common.{JobScheduler, LifecycleComponent, AkkaAsync, Jobs}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DfpAgentLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler = Jobs,
  akkaAsync: AkkaAsync = AkkaAsync)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    jobs.deschedule("DfpDataRefreshJob")
  }}

  def refreshDfpAgent(): Unit = DfpAgent.refresh()

  override def start() = {
    jobs.deschedule("DfpDataRefreshJob")
    jobs.scheduleEveryNMinutes("DfpDataRefreshJob", 1) {
      refreshDfpAgent()
      Future.successful(())
    }

    akkaAsync.after1s {
      refreshDfpAgent()
    }
  }
}

class FaciaDfpAgentLifecycle(appLifeCycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends DfpAgentLifecycle(appLifeCycle) {

  override def refreshDfpAgent(): Unit = {
    DfpAgent.refresh()
    DfpAgent.refreshFaciaSpecificData()
  }
}
