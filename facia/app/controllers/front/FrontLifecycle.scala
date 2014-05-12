package controllers.front

import common.{AkkaAsync, Jobs}
import play.api.GlobalSettings
import services.ConfigAgent

trait FrontLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)

    Jobs.deschedule("FrontRefreshJob")
    Jobs.schedule("FrontRefreshJob", "0 * * * * ?") {
      ConfigAgent.refresh()
    }

    AkkaAsync {
      ConfigAgent.refresh()
    }
  }

  override def onStop(app: play.api.Application) {
    Jobs.deschedule("FrontRefreshJob")
    ConfigAgent.close()
    super.onStop(app)
  }
}
