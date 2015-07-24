package common.dfp

import common.{AkkaAsync, Jobs}
import play.api.{Application, GlobalSettings}

trait DfpAgentLifecycle extends GlobalSettings {

  def refreshDfpAgent(): Unit = DfpAgent.refresh()

  val refreshInterval: Int = 1

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.scheduleEveryNMinutes("DfpDataRefreshJob", refreshInterval) {
      refreshDfpAgent()
    }

    AkkaAsync {
      refreshDfpAgent()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("DfpDataRefreshJob")
    super.onStop(app)
  }
}

trait FaciaDfpAgentLifecycle extends DfpAgentLifecycle {

  override val refreshInterval: Int = 2

  override def refreshDfpAgent(): Unit = {
    DfpAgent.refresh()
    DfpAgent.refreshFaciaSpecificData()
  }
}
