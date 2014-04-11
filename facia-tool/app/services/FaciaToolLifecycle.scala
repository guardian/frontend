package services

import play.api.GlobalSettings
import common.{AkkaAsync, Jobs}

trait FaciaToolLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)

    Jobs.deschedule("FrontRefreshJob")
    Jobs.schedule("FrontRefreshJob", "0 * * * * ?") {
      ConfigAgent.refresh()
    }

    AkkaAsync{
      ConfigAgent.refresh()
    }
  }

  override def onStop(app: play.api.Application) {
    Jobs.deschedule("FrontRefreshJob")
    ConfigAgent.close()
    super.onStop(app)
  }
}
