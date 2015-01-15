package business

import play.api.{Application, GlobalSettings}

trait HideousHackLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    HideousHack.start()
  }

  override def onStop(app: Application): Unit = {
    HideousHack.stop()
    super.onStop(app)
  }
}
