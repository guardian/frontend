package common.dfp

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DfpAgentLifecycle(appLifeCycle: ApplicationLifecycle, jobs: JobScheduler, pekkoAsync: PekkoAsync)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  appLifeCycle.addStopHook { () =>
    Future {
      jobs.deschedule("DfpDataRefreshJob")
    }
  }

  def refreshDfpAgent(): Unit = DfpAgent.refresh()

  override def start(): Unit = {
    jobs.deschedule("DfpDataRefreshJob")
    jobs.scheduleEveryNMinutes("DfpDataRefreshJob", 1) {
      refreshDfpAgent()
      Future.successful(())
    }

    pekkoAsync.after1s {
      refreshDfpAgent()
    }
  }
}

class FaciaDfpAgentLifecycle(appLifeCycle: ApplicationLifecycle, jobs: JobScheduler, pekkoAsync: PekkoAsync)(implicit
    ec: ExecutionContext,
) extends DfpAgentLifecycle(appLifeCycle, jobs, pekkoAsync) {

  override def refreshDfpAgent(): Unit = {
    DfpAgent.refresh()
    DfpAgent.refreshFaciaSpecificData()
  }
}
