package dfp

import common.{AkkaAsync, Jobs}
import play.api.{Application, GlobalSettings}

trait DfpAgentLifecycle extends GlobalSettings {

  def refresh(): Unit = DfpAgent.refresh()

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.scheduleEveryNMinutes("DfpDataRefreshJob", 1) {
      refresh()
    }

    AkkaAsync {
      refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("DfpDataRefreshJob")
    super.onStop(app)
  }
}

trait FaciaDfpAgentLifecycle extends DfpAgentLifecycle {
  override def refresh(): Unit = {
    DfpAgent.refresh()
    DfpAgent.refreshFaciaSpecificData()
  }
}
