package controllers.front

import common.Jobs
import play.api.GlobalSettings

trait FrontLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)

    ConfigAgent.refresh()

    Jobs.deschedule("FrontRefreshJob")
    Jobs.schedule("FrontRefreshJob", "0 * * * * ?") {
      ConfigAgent.refresh()
    }
  }

  override def onStop(app: play.api.Application) {
    Jobs.deschedule("FrontRefreshJob")
    ConfigAgent.close()
    super.onStop(app)
  }
}
