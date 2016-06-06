package common.dfp

import common.{LifecycleComponent, AkkaAsync, Jobs}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DfpAgentLifecycle(appLifeCycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    Jobs.deschedule("DfpDataRefreshJob")
  }}

  def refreshDfpAgent(): Unit = DfpAgent.refresh()

  override def start() = {
    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.scheduleEveryNMinutes("DfpDataRefreshJob", 1) {
      refreshDfpAgent()
      Future.successful(())
    }

    AkkaAsync {
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
