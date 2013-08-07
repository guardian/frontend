package controllers.front

import play.api.GlobalSettings

trait FrontLifecycle extends GlobalSettings {
  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Front.start()
  }

  override def onStop(app: play.api.Application) {
    Front.stop()
    super.onStop(app)
  }
}
