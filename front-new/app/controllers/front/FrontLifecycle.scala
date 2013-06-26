package controllers.front

import play.api.GlobalSettings

trait FrontLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Front.startup()
  }

  override def onStop(app: play.api.Application) {
    Front.shutdown()
    super.onStop(app)
  }
}
